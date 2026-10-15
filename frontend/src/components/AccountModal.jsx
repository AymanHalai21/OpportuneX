import React, { useState } from 'react'
import { X, Bell, Shield, Sliders, HelpCircle, Send, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './AccountModal.css'

export default function AccountModal() {
  const { activeAccountModal, setActiveAccountModal, showToast } = useApp()

  // Settings State
  const [themeMode, setThemeMode] = useState('light')
  const [campusFeed, setCampusFeed] = useState(true)
  const [autoCalendarSync, setAutoCalendarSync] = useState(false)

  // Notification State
  const [emailDigest, setEmailDigest] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [hackathonReminders, setHackathonReminders] = useState(true)
  const [checkInUpdates, setCheckInUpdates] = useState(true)

  // Privacy State
  const [profilePublic, setProfilePublic] = useState(true)
  const [showCollegeBadge, setShowCollegeBadge] = useState(true)
  const [allowDirectMessages, setAllowDirectMessages] = useState(true)

  // Help & Support State
  const [supportCategory, setSupportCategory] = useState('Ticketing & QR')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitted, setSupportSubmitted] = useState(false)

  if (!activeAccountModal) return null

  const handleClose = () => {
    setActiveAccountModal(null)
    setSupportSubmitted(false)
  }

  const handleSaveSettings = () => {
    showToast('Preferences saved successfully', 'success')
    handleClose()
  }

  const handleSendSupport = (e) => {
    e.preventDefault()
    if (!supportMessage.trim()) return
    setSupportSubmitted(true)
    setTimeout(() => {
      showToast('Your message has been sent to OpportuneX Support', 'success')
      handleClose()
    }, 1000)
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="account-modal-header-info">
            {activeAccountModal === 'Settings' && <Sliders size={18} className="account-modal-icon" />}
            {activeAccountModal === 'Notification Preferences' && <Bell size={18} className="account-modal-icon" />}
            {activeAccountModal === 'Privacy' && <Shield size={18} className="account-modal-icon" />}
            {activeAccountModal === 'Help & Support' && <HelpCircle size={18} className="account-modal-icon" />}
            <h3>{activeAccountModal}</h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="account-modal-body">
          {activeAccountModal === 'Settings' && (
            <div className="account-modal-content">
              <div className="account-toggle-row">
                <div>
                  <strong>Campus-Exclusive Feed</strong>
                  <p>Prioritize events hosted at or partnered with your college.</p>
                </div>
                <input
                  type="checkbox"
                  checked={campusFeed}
                  onChange={(e) => setCampusFeed(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>Google Calendar Sync</strong>
                  <p>Automatically add confirmed event registrations to your calendar.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCalendarSync}
                  onChange={(e) => setAutoCalendarSync(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-select-row">
                <label htmlFor="theme-select">Interface Theme</label>
                <select
                  id="theme-select"
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  className="account-select"
                >
                  <option value="light">Figma Standard (Light)</option>
                  <option value="system">Match Device System</option>
                </select>
              </div>
            </div>
          )}

          {activeAccountModal === 'Notification Preferences' && (
            <div className="account-modal-content">
              <div className="account-toggle-row">
                <div>
                  <strong>Weekly Event Digest</strong>
                  <p>Curated list of top hackathons and workshops every Monday.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>24-Hour Event Reminders</strong>
                  <p>Push alerts before events you're attending start.</p>
                </div>
                <input
                  type="checkbox"
                  checked={hackathonReminders}
                  onChange={(e) => setHackathonReminders(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>Organizer Check-in Alerts</strong>
                  <p>Real-time attendance milestone notifications for hosted events.</p>
                </div>
                <input
                  type="checkbox"
                  checked={checkInUpdates}
                  onChange={(e) => setCheckInUpdates(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>SMS Urgency Alerts</strong>
                  <p>SMS notifications for venue changes or weather contingencies.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="account-checkbox"
                />
              </div>
            </div>
          )}

          {activeAccountModal === 'Privacy' && (
            <div className="account-modal-content">
              <div className="account-toggle-row">
                <div>
                  <strong>Public Student Profile</strong>
                  <p>Allow student peers to discover your registered events & badges.</p>
                </div>
                <input
                  type="checkbox"
                  checked={profilePublic}
                  onChange={(e) => setProfilePublic(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>Display Verified College Badge</strong>
                  <p>Show verified college status next to your name on attendee rosters.</p>
                </div>
                <input
                  type="checkbox"
                  checked={showCollegeBadge}
                  onChange={(e) => setShowCollegeBadge(e.target.checked)}
                  className="account-checkbox"
                />
              </div>

              <div className="account-toggle-row">
                <div>
                  <strong>Organizer Communications</strong>
                  <p>Allow event organizers to send logistical updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowDirectMessages}
                  onChange={(e) => setAllowDirectMessages(e.target.checked)}
                  className="account-checkbox"
                />
              </div>
            </div>
          )}

          {activeAccountModal === 'Help & Support' && (
            <div className="account-modal-content">
              <div className="faq-section">
                <h4>Frequently Asked Questions</h4>
                <details className="faq-item">
                  <summary>How do I show my QR ticket at check-in?</summary>
                  <p>Open "My Events", select the event, or tap "You're Attending" on the event details page to display your entry credentials.</p>
                </details>
                <details className="faq-item">
                  <summary>Can I host an event as a student club?</summary>
                  <p>Yes! Click "Host New Event" in the navigation bar to publish an event and unlock organizer dashboard analytics.</p>
                </details>
              </div>

              <form onSubmit={handleSendSupport} className="support-form">
                <h4>Contact Student Support</h4>
                <label>
                  <span>Category</span>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="account-select"
                  >
                    <option value="Ticketing & QR">Ticketing &amp; QR Check-in</option>
                    <option value="Organizer Dashboard">Organizer Dashboard</option>
                    <option value="Profile & Badges">Profile &amp; Badges</option>
                    <option value="Other Query">Other Query</option>
                  </select>
                </label>

                <label>
                  <span>Message</span>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe what you need help with..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  disabled={supportSubmitted}
                  className="btn btn-primary btn-block support-submit-btn"
                >
                  {supportSubmitted ? (
                    <>
                      <Check size={16} /> Sent!
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {activeAccountModal !== 'Help & Support' && (
          <div className="modal-footer account-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
