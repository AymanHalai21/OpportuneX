import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowLeft, Share2, CheckCircle2, LayoutDashboard } from 'lucide-react'
import CategoryImage from '../components/CategoryImage.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getOrganizerAvatar, getAttendeeAvatar, DEFAULT_ORGANIZER_CREST, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatar.js'
import './EventDetail.css'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, toggleJoinEvent, toggleFollowOrganizer, followedOrganizers, showToast } = useApp()

  const event = useMemo(() => getEventById(id), [getEventById, id])

  if (!event) {
    return (
      <div className="container event-detail-page">
        <p>Event not found.</p>
        <Link to="/explore" className="btn btn-secondary">
          Back to Explore
        </Link>
      </div>
    )
  }

  const isAttending = !!event.attending
  const isFollowing = followedOrganizers.includes(event.organizer?.name)
  const percentFull = Math.min(100, Math.round((event.registered / (event.capacity || 1)) * 100))

  const handleShare = async () => {
    const shareData = {
      title: `${event.title} on OpportuneX`,
      text: `${event.title} - ${event.dateLabel} at ${event.venue}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Event link copied to clipboard!', 'success')
      }
    } catch {
      // Fallback
      showToast('Event link copied to clipboard!', 'success')
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/explore')
    }
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-hero">
        <div className="event-detail-hero-nav">
          <button className="event-detail-back-btn" onClick={handleBack} aria-label="Go back">
            <ArrowLeft size={16} /> <span>Back</span>
          </button>
          <button className="event-detail-hero-share" onClick={handleShare} aria-label="Share event">
            <Share2 size={16} />
          </button>
        </div>
        <CategoryImage
          category={event.category}
          image={event.image || event.banner}
          title={event.title}
          className="event-detail-hero-image"
        />
        <div className="event-detail-hero-overlay">
          <span className="pill category-pill" data-category={event.category}>
            {event.category}
          </span>
          <h1>{event.title}</h1>
        </div>
      </div>

      <div className="container event-detail-body">
        <div className="event-detail-mobile-actions">
          <button
            className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'} btn-lg btn-block event-detail-mobile-join`}
            onClick={() => toggleJoinEvent(event.id)}
          >
            {isAttending ? (
              <>
                <CheckCircle2 size={18} /> You're Attending — Click to Leave
              </>
            ) : (
              `Join Event — ${event.free ? 'Free' : 'Register'} →`
            )}
          </button>
          {event.hostedByMe && (
            <Link to={`/dashboard/${event.id}`} className="btn btn-secondary btn-block">
              <LayoutDashboard size={16} /> Open Organizer Dashboard
            </Link>
          )}
        </div>

        <div className="event-detail-grid">
          <div className="event-detail-main">
            <div className="event-detail-facts">
              <div className="card event-detail-fact">
                <span className="event-detail-fact-label">
                  <Calendar size={14} /> Date
                </span>
                <strong>{event.dateLabel}</strong>
              </div>
              <div className="card event-detail-fact">
                <span className="event-detail-fact-label">
                  <Clock size={14} /> Time
                </span>
                <strong>{event.time}</strong>
              </div>
              <div className="card event-detail-fact event-detail-fact--wide">
                <span className="event-detail-fact-label">
                  <MapPin size={14} /> Venue
                </span>
                <strong>{event.venue}</strong>
              </div>
            </div>

            <div className="card event-detail-organizer">
              <img
                src={getOrganizerAvatar(event.organizer)}
                alt={event.organizer?.name || 'Organizer'}
                className="event-detail-organizer-avatar"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_ORGANIZER_CREST
                }}
              />
              <div className="event-detail-organizer-text">
                <span>Organized by</span>
                <strong>{event.organizer?.name}</strong>
                <small>{event.organizer?.subtitle}</small>
              </div>
              <button
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => toggleFollowOrganizer(event.organizer?.name)}
              >
                {isFollowing ? '✓ Following' : '+ Follow'}
              </button>
            </div>

            <div className="card event-detail-about">
              <h3>About this event</h3>
              <p>{event.description}</p>
              <div className="event-detail-tags">
                {event.tags?.map((tag) => (
                  <span key={tag} className="event-detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="card event-detail-attendees">
              <h3>Attendees</h3>
              <div className="event-detail-attendees-row">
                <div className="event-detail-avatar-stack">
                  {[0, 1, 2, 3].map((n) => (
                    <img
                      key={n}
                      src={getAttendeeAvatar(n)}
                      alt={`Attendee ${n + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_NEUTRAL_AVATAR
                      }}
                    />
                  ))}
                </div>
                <div>
                  <strong>{event.registered} students registered</strong>
                  <p>from 30+ colleges</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="event-detail-sidebar">
            <div className="card event-detail-sidebar-card">
              <div className="event-detail-sidebar-header">
                <div>
                  <strong>{event.free ? 'Free Entry' : 'Paid Entry'}</strong>
                  <p>{event.free ? 'No registration fee' : 'Registration fee applies'}</p>
                </div>
              </div>

              <div className="event-detail-sidebar-progress">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percentFull}%` }} />
                </div>
                <div className="event-card-progress-labels">
                  <span>{event.registered} registered</span>
                  <span>{event.seatsLeft} left</span>
                </div>
              </div>

              <button
                className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'} btn-block btn-lg`}
                onClick={() => toggleJoinEvent(event.id)}
              >
                {isAttending ? (
                  <>
                    <CheckCircle2 size={16} /> You're Attending
                  </>
                ) : (
                  'Join Event →'
                )}
              </button>

              {event.hostedByMe && (
                <Link to={`/dashboard/${event.id}`} className="btn btn-secondary btn-block">
                  <LayoutDashboard size={15} /> Organizer Dashboard
                </Link>
              )}

              <div className="event-detail-sidebar-facts">
                <div>
                  <Calendar size={14} /> {event.dateLabel}
                </div>
                <div>
                  <Clock size={14} /> {event.time}
                </div>
                <div>
                  <MapPin size={14} /> {event.venue}
                </div>
              </div>

              <button className="btn btn-secondary btn-block" onClick={handleShare}>
                <Share2 size={15} /> Share Event
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

