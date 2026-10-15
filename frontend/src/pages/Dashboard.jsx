import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Users, CheckSquare, Armchair, CalendarDays, QrCode, Download, Edit3, Trash2, ArrowLeft, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ScannerModal from '../components/ScannerModal.jsx'
import EditEventModal from '../components/EditEventModal.jsx'
import { getAttendeeAvatar, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatar.js'
import './Dashboard.css'

export default function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, toggleCheckInAttendee, cancelEvent, showToast } = useApp()

  const [scannerOpen, setScannerOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const event = useMemo(() => getEventById(id), [getEventById, id])

  if (!event || !event.dashboard) {
    return (
      <div className="container dashboard-page">
        <div className="dashboard-empty-state card">
          <p>No dashboard available for this event.</p>
          <Link to="/my-events" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to My Events
          </Link>
        </div>
      </div>
    )
  }

  const { dashboard } = event
  const percentFull = dashboard.percentFullOverride ?? Math.round((event.registered / (event.capacity || 1)) * 100)
  const maxCollege = Math.max(...(dashboard.collegeBreakdown?.map((c) => c.count) || [1]), 1)

  // Export CSV handler
  const handleExportCSV = () => {
    if (!dashboard.attendees || dashboard.attendees.length === 0) {
      showToast('No attendees registered yet to export.', 'info')
      return
    }

    const headers = ['Student Name', 'College', 'Registered Time', 'Check-In Status']
    const rows = dashboard.attendees.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${(a.college || 'N/A').replace(/"/g, '""')}"`,
      `"${a.registeredLabel || 'N/A'}"`,
      `"${a.status}"`
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${event.id}-attendees.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`Exported ${dashboard.attendees.length} attendees to CSV`, 'success')
  }

  // Cancel Event handler
  const handleCancelEvent = () => {
    const confirmed = window.confirm(`Are you sure you want to cancel "${event.title}"? This cannot be undone.`)
    if (confirmed) {
      cancelEvent(event.id)
      navigate('/my-events')
    }
  }

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <button className="dashboard-back-btn" onClick={() => navigate('/my-events')}>
            <ArrowLeft size={14} /> Back to My Events
          </button>
          <h1>Organizer Dashboard</h1>
          <div className="dashboard-header-meta">
            <Link to={`/events/${event.id}`} className="dashboard-event-link" title="View Public Event Page">
              <span>{event.title}</span>
              <ExternalLink size={13} />
            </Link>
            <span className="dashboard-meta-dot">·</span>
            <span>{event.dateLabel}</span>
            <span className="dashboard-meta-dot">·</span>
            <span>{event.venue}</span>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn btn-secondary" onClick={() => setEditModalOpen(true)}>
            <Edit3 size={15} /> Edit Event
          </button>
          <button className="btn btn-danger" onClick={handleCancelEvent}>
            <Trash2 size={15} /> Cancel Event
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="card dashboard-stat dashboard-stat--blue">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrapper">
              <Users size={18} />
            </div>
            <span className="dashboard-stat-badge">+12 today</span>
          </div>
          <strong>{event.registered}</strong>
          <span className="dashboard-stat-label">Total Registrations</span>
        </div>
        <div className="card dashboard-stat dashboard-stat--green">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrapper">
              <CheckSquare size={18} />
            </div>
            <span className="dashboard-stat-badge">{dashboard.checkInRate}% check-in rate</span>
          </div>
          <strong>{dashboard.checkedIn}</strong>
          <span className="dashboard-stat-label">Checked In</span>
        </div>
        <div className="card dashboard-stat dashboard-stat--amber">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrapper">
              <Armchair size={18} />
            </div>
            <span className="dashboard-stat-badge">{percentFull}% full</span>
          </div>
          <strong>{event.seatsLeft}</strong>
          <span className="dashboard-stat-label">Seats Left</span>
        </div>
        <div className="card dashboard-stat dashboard-stat--purple">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon-wrapper">
              <CalendarDays size={18} />
            </div>
            <span className="dashboard-stat-badge">{event.dateLabel.split(/[–,]/)[0]}</span>
          </div>
          <strong>{dashboard.daysUntil}</strong>
          <span className="dashboard-stat-label">Days Until Event</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-attendees">
          <div className="dashboard-attendees-header">
            <div>
              <h3>Attendees ({dashboard.attendees?.length || 0})</h3>
              <small>Click status pill to toggle check-in</small>
            </div>
            <button className="btn btn-secondary dashboard-export" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          {dashboard.attendees?.length === 0 ? (
            <div className="dashboard-attendees-empty">
              <p>No attendees registered yet.</p>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>College</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.attendees.map((a, index) => (
                    <tr key={a.name}>
                      <td>
                        <div className="dashboard-student">
                          <img
                            src={getAttendeeAvatar(a, index)}
                            alt={a.name}
                            className="dashboard-student-avatar"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_NEUTRAL_AVATAR
                            }}
                          />
                          <span className="dashboard-student-name">{a.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="dashboard-college-cell">{a.college || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="dashboard-date-cell">{a.registeredLabel}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`pill dashboard-status ${
                            a.status === 'Checked In' ? 'dashboard-status--checked' : 'dashboard-status--registered'
                          }`}
                          onClick={() => toggleCheckInAttendee(event.id, a.name)}
                          title="Click to toggle check-in status"
                          aria-label={`Toggle check-in for ${a.name}`}
                        >
                          {a.status === 'Checked In' ? '✓ Checked In' : 'Registered'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-side">
          <div className="card dashboard-qr">
            <h3>QR Check-in</h3>
            <div className="dashboard-qr-box" onClick={() => setScannerOpen(true)} role="button" tabIndex={0}>
              <div className="dashboard-qr-frame">
                <QrCode size={48} className="dashboard-qr-icon" />
                <span className="dashboard-qr-scan-line" />
              </div>
              <span className="dashboard-qr-tip">Click to Launch Scanner</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => setScannerOpen(true)}>
              <QrCode size={16} /> Open Scanner
            </button>
          </div>

          <div className="card dashboard-progress">
            <h3>Registration Progress</h3>
            <div className="dashboard-main-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percentFull}%` }} />
              </div>
              <div className="dashboard-progress-labels">
                <span><strong>{event.registered}</strong> registered</span>
                <span><strong>{event.seatsLeft}</strong> remaining</span>
              </div>
            </div>

            <div className="dashboard-breakdown-section">
              <span className="dashboard-breakdown-title">College Breakdown</span>
              <div className="dashboard-college-list">
                {dashboard.collegeBreakdown?.map((c) => (
                  <div key={c.college} className="dashboard-college-row">
                    <span className="dashboard-college-name" title={c.college}>{c.college}</span>
                    <div className="progress-track dashboard-college-track">
                      <div className="progress-fill" style={{ width: `${(c.count / maxCollege) * 100}%` }} />
                    </div>
                    <strong className="dashboard-college-count">{c.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScannerModal event={event} isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <EditEventModal event={event} isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  )
}

