import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, ChevronDown } from 'lucide-react'
import CategoryFilter from '../components/CategoryFilter.jsx'
import EventCard from '../components/EventCard.jsx'
import SearchInput from '../components/SearchInput.jsx'
import { CATEGORIES } from '../data/events.js'
import { useApp } from '../context/AppContext.jsx'
import './Discover.css'

const STATS = [
  { value: '500+', label: 'Events Listed' },
  { value: '50K+', label: 'Students Joined' },
  { value: '200+', label: 'Colleges' },
  { value: '₹2Cr+', label: 'Prize Money' }
]

export default function Discover() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { events, getFeaturedEvents, getHostedEvents } = useApp()

  const featured = getFeaturedEvents()
  const hosted = getHostedEvents()
  const totalEnrollments = hosted.reduce((sum, e) => sum + e.registered, 0)

  const goExplore = (searchQuery = query, suggestionItem = null) => {
    let targetCat = activeCategory
    if (suggestionItem?.type === 'Category') {
      targetCat = suggestionItem.text
    }
    navigate('/explore', { state: { category: targetCat, query: searchQuery } })
  }

  return (
    <div className="discover-page">
      <section className="discover-hero">
        <div className="container discover-hero-inner">
          <span className="pill discover-live-badge">
            <Flame size={13} /> 126 events happening this month
          </span>
          <h1 className="discover-headline">
            Discover Events
            <br />
            Made for Students
          </h1>
          <p className="discover-subhead">
            Hackathons, workshops, seminars, cultural fests, and competitions — all in one place.
          </p>

          <div className="discover-search-row">
            <SearchInput
              id="discover-hero-search"
              placeholder="Search events, topics, skills..."
              value={query}
              onChange={setQuery}
              onSearch={(val, item) => goExplore(val, item)}
              events={events}
            />
            <button className="btn btn-secondary discover-filter-btn" onClick={() => goExplore()}>
              Filter <ChevronDown size={16} />
            </button>
          </div>

          <div className="discover-stats">
            {STATS.map((s) => (
              <div key={s.label} className="discover-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container discover-body">
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={(cat) => {
            setActiveCategory(cat)
            navigate('/explore', { state: { category: cat } })
          }}
        />

        {hosted.length > 0 && (
          <div className="hosted-banner">
            <div className="hosted-banner-main">
              <span className="hosted-banner-label">YOUR HOSTED EVENTS</span>
              <h3>{totalEnrollments} total enrollments so far</h3>
              <p>
                Across {hosted.length} active events · +12 new today
              </p>
            </div>
            <div className="hosted-banner-stats">
              {hosted.slice(0, 2).map((ev) => {
                const percentFull = ev.dashboard?.percentFullOverride ?? Math.round((ev.registered / (ev.capacity || 1)) * 100)
                return (
                  <div key={ev.id} className="hosted-banner-stat">
                    <span>{ev.title}</span>
                    <strong>{ev.registered}</strong>
                    <small>{percentFull}% full</small>
                  </div>
                )
              })}
            </div>
            <Link to={`/dashboard/${hosted[0].id}`} className="btn btn-secondary hosted-banner-cta">
              View Dashboard →
            </Link>
          </div>
        )}

        <div className="discover-section-header">
          <h2>Featured Events</h2>
          <Link to="/explore" className="discover-view-all">
            View all →
          </Link>
        </div>

        <div className="event-grid">
          {featured.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </div>
  )
}

