import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('opportunex_token'))
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [followedOrganizers, setFollowedOrganizers] = useState([])
  const [toast, setToast] = useState(null)
  const [activeAccountModal, setActiveAccountModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (message, type='info') => setToast({message,type,id:Date.now()})
  const hideToast = () => setToast(null)

  const refresh = async () => {
    try {
      const [me, rawEvents, follows] = await Promise.all([api.me(), api.events(), api.follows()])
      const hosted = await Promise.all(rawEvents.filter(e => e.hostedByMe).map(async e => {
        try { return await api.dashboard(e.dbId ?? e.id) } catch { return e }
      }))
      const dashboardMap = new Map(hosted.map(e => [String(e.dbId ?? e.id), e]))
      const evs = rawEvents.map(e => dashboardMap.get(String(e.dbId ?? e.id)) || e)
      setUser(me)
      setFollowedOrganizers(follows)
      setEvents(evs)
      setIsAuthenticated(true)
    } catch (e) {
      if (e.status === 401 || e.status === 404) {
        // token missing / expired / user deleted -> back to the login page
        localStorage.removeItem('opportunex_token')
        setUser(null); setEvents([]); setIsAuthenticated(false)
      } else {
        // backend down or a server error: keep the session and tell the user instead of silently logging out
        showToast(e.message || 'Cannot reach the server. Please try again.', 'error')
      }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (isAuthenticated) refresh()
    else setLoading(false)
  }, [isAuthenticated])

  const login = async (email, password) => {
    const result = await api.login(email, password)
    localStorage.setItem('opportunex_token', result.token)
    setUser(result.user); setIsAuthenticated(true)
    await refresh()
    showToast('Signed in successfully','success')
    return result
  }

  const signup = async (name,email,password,college) => {
    const result = await api.signup(name,email,password,college)
    localStorage.setItem('opportunex_token', result.token)
    setUser(result.user); setIsAuthenticated(true)
    await refresh()
    showToast('Account created successfully','success')
    return result
  }

  const logout = () => {
    localStorage.removeItem('opportunex_token')
    setUser(null); setEvents([]); setIsAuthenticated(false)
    showToast('Signed out','info')
  }

  const toggleJoinEvent = async (eventId) => {
    try {
      await api.join(eventId)
      await refresh()
      const ev = await api.event(eventId)
      const attending = !!ev?.attending
      showToast(attending ? 'You’re registered! Event added to My Events.' : 'Registration cancelled.', attending ? 'success':'info')
      return attending
    } catch(e) { showToast(e.message,'error'); return false }
  }

  const toggleFollowOrganizer = async (organizerName) => {
    try {
      await api.follow(organizerName)
      setFollowedOrganizers(prev => prev.includes(organizerName) ? prev.filter(x=>x!==organizerName) : [...prev,organizerName])
      showToast('Organizer follow status updated','success')
    } catch(e) { showToast(e.message,'error') }
  }

  const toggleCheckInAttendee = async (eventId, attendeeName) => {
    try {
      await api.attendeeToggle(eventId,attendeeName)
      const updated = await api.dashboard(eventId)
      setEvents(prev => prev.map(e => String(e.dbId ?? e.id) === String(eventId) ? updated : e))
      showToast(`Updated check-in status for ${attendeeName}`,'success')
    } catch(e){showToast(e.message,'error')}
  }

  const checkInByTicketCode = async (eventId,ticketCode,studentName='Admitted Student') => {
    try {
      await api.checkin(eventId,{ticketCode,studentName})
      const updated = await api.dashboard(eventId)
      setEvents(prev => prev.map(e => String(e.dbId ?? e.id) === String(eventId) ? updated : e))
      showToast(`Verified & checked in ticket ${ticketCode} (${studentName})`,'success')
      return true
    } catch(e){showToast(e.message,'error'); return false}
  }

  const createEvent = async (eventData) => {
    try {
      const created = await api.createEvent(eventData)
      await refresh()
      showToast(`"${created.title}" published successfully!`,'success')
      return created
    } catch(e){showToast(e.message,'error'); throw e}
  }

  const updateEvent = async (eventId, updatedFields) => {
    try { await api.updateEvent(eventId,updatedFields); await refresh(); showToast('Event details updated successfully','success') }
    catch(e){showToast(e.message,'error')}
  }

  const cancelEvent = async (eventId) => {
    try { await api.cancelEvent(eventId); await refresh(); showToast('Event has been cancelled','info') }
    catch(e){showToast(e.message,'error')}
  }

  const updateUserProfile = async (newProfile) => {
    try { setUser(await api.profile(newProfile)); showToast('Profile updated successfully','success') }
    catch(e){showToast(e.message,'error')}
  }

  const addInterest = async (interest) => {
    try { setUser(await api.addInterest(interest)); showToast(`Added "${interest}" to your interests`,'success') }
    catch(e){showToast(e.message,'error')}
  }
  const removeInterest = async (interest) => {
    try { setUser(await api.removeInterest(interest)); showToast(`Removed "${interest}"`,'info') }
    catch(e){showToast(e.message,'error')}
  }

  const getEventById = id => events.find(e => String(e.dbId ?? e.id) === String(id))
  const getJoinedEvents = () => events.filter(e => e.attending)
  const getHostedEvents = () => events.filter(e => e.hostedByMe)
  const getFeaturedEvents = () => events.slice(0,3)

  return <AppContext.Provider value={{refresh,isAuthenticated,user,events,followedOrganizers,activeAccountModal,setActiveAccountModal,toast,showToast,hideToast,loading,login,signup,logout,toggleJoinEvent,toggleFollowOrganizer,toggleCheckInAttendee,checkInByTicketCode,createEvent,updateEvent,cancelEvent,updateUserProfile,addInterest,removeInterest,getEventById,getJoinedEvents,getHostedEvents,getFeaturedEvents}}>
    {children}
  </AppContext.Provider>
}
export function useApp(){const ctx=useContext(AppContext);if(!ctx)throw new Error('useApp must be used within AppProvider');return ctx}
