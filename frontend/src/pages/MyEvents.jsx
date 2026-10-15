import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Tent, Medal, Plus, Compass } from 'lucide-react'
import EventCard from '../components/EventCard.jsx'
import { useApp } from '../context/AppContext.jsx'
import './MyEvents.css'

export default function MyEvents() {
  const [tab, setTab] = useState('joined')
  const { user, getJoinedEvents, getHostedEvents } = useApp()

  const joined = getJoinedEvents()
  const hosted = getHostedEvents()
  const list = tab === 'joined' ? joined : hosted

  return (
    <div className="container my-events-page">
      <div className="my-events-header">
        <h1>My Events</h1>
        <p>Manage and view all events you've joined or hosted</p>
      </div>

      <div className="my-events-stats">
        <div className="card my-events-stat">
          <div className="my-events-stat-icon-wrapper my-events-stat-icon-wrapper--blue">
            <FileText size={20} className="my-events-stat-icon" />
          </div>
          <div className="my-events-stat-info">
            <strong>{user.stats?.eventsJoined ?? joined.length}</strong>
            <span>Events Joined</span>
          </div>
        </div>
        <div className="card my-events-stat">
          <div className="my-events-stat-icon-wrapper my-events-stat-icon-wrapper--green">
            <Tent size={20} className="my-events-stat-icon" />
          </div>
          <div className="my-events-stat-info">
            <strong>{user.stats?.eventsHosted ?? hosted.length}</strong>
            <span>Events Hosted</span>
          </div>
        </div>
        <div className="card my-events-stat">
          <div className="my-events-stat-icon-wrapper my-events-stat-icon-wrapper--purple">
            <Medal size={20} className="my-events-stat-icon" />
          </div>
          <div className="my-events-stat-info">
            <strong>{user.badges?.length || 6}</strong>
            <span>Badges &amp; Certificates</span>
          </div>
        </div>
      </div>

      <div className="my-events-tabs">
        <button
          className={`my-events-tab${tab === 'joined' ? ' active' : ''}`}
          onClick={() => setTab('joined')}
        >
          Joined ({joined.length})
        </button>
        <button
          className={`my-events-tab${tab === 'hosted' ? ' active' : ''}`}
          onClick={() => setTab('hosted')}
        >
          Hosted ({hosted.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="my-events-empty card">
          <div className="my-events-empty-icon">
            {tab === 'joined' ? <Compass size={32} /> : <Tent size={32} />}
          </div>
          <h3>{tab === 'joined' ? 'No Joined Events Yet' : 'No Hosted Events Yet'}</h3>
          <p>
            {tab === 'joined'
              ? "You haven't registered for any events yet. Explore upcoming campus hackathons, workshops, and competitions!"
              : "You haven't created any events yet. Publish an event to manage attendees, check-ins, and analytics."}
          </p>
          <div className="my-events-empty-actions">
            {tab === 'joined' ? (
              <Link to="/explore" className="btn btn-primary">
                <Compass size={16} /> Explore Events
              </Link>
            ) : (
              <Link to="/host-event" className="btn btn-primary">
                <Plus size={16} /> Host an Event
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="event-grid my-events-grid">
          {list.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  )
}


