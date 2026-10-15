import { Link } from 'react-router-dom'
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react'
import CategoryImage from './CategoryImage.jsx'
import './EventCard.css'

export default function EventCard({ event }) {
  const percentFull = Math.round((event.registered / event.capacity) * 100)

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div className="event-card-image">
        <CategoryImage category={event.category} image={event.image || event.banner} title={event.title} />
        <span className="pill category-pill" data-category={event.category}>
          {event.category}
        </span>
        {event.online && <span className="pill event-card-online">Online</span>}
        {event.attending && (
          <span className="pill event-card-attending">
            <CheckCircle2 size={13} /> Attending
          </span>
        )}
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-meta">
          <Calendar size={14} />
          <span>
            {event.dateLabel} · {event.time}
          </span>
        </div>
        <div className="event-card-meta">
          <MapPin size={14} />
          <span>{event.venue}</span>
        </div>

        <div className="event-card-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentFull}%` }} />
          </div>
          <div className="event-card-progress-labels">
            <span>{event.registered} registered</span>
            <span>{event.seatsLeft} left</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
