import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SearchX, RotateCcw } from 'lucide-react'
import CategoryFilter from '../components/CategoryFilter.jsx'
import EventCard from '../components/EventCard.jsx'
import SearchInput from '../components/SearchInput.jsx'
import { CATEGORIES } from '../data/events.js'
import { useApp } from '../context/AppContext.jsx'
import { matchEvent, normalizeText } from '../utils/search.js'
import './Explore.css'

export default function Explore() {
  const location = useLocation()
  const { events } = useApp()
  const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All')
  const [query, setQuery] = useState(location.state?.query || '')
  const [sort, setSort] = useState('date')

  const filtered = useMemo(() => {
    let list = events.filter((ev) => (activeCategory === 'All' ? true : ev.category === activeCategory))

    // Apply normalized flexible multi-field search
    if (query && normalizeText(query)) {
      list = list.filter((ev) => matchEvent(ev, query))
    }

    // Apply sorting
    if (sort === 'date') {
      list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sort === 'popularity') {
      list = [...list].sort((a, b) => b.registered - a.registered)
    } else if (sort === 'seats') {
      list = [...list].sort((a, b) => b.seatsLeft - a.seatsLeft)
    }

    return list
  }, [events, activeCategory, query, sort])

  const handleSuggestionSelect = (text, item) => {
    if (item?.type === 'Category') {
      setActiveCategory(item.text)
      setQuery('')
    } else {
      setQuery(text)
    }
  }

  const handleResetFilters = () => {
    setQuery('')
    setActiveCategory('All')
  }

  return (
    <div className="container explore-page">
      <div className="explore-header">
        <h1>Explore Events</h1>
        <p>
          {query.trim() || activeCategory !== 'All'
            ? `Showing ${filtered.length} of ${events.length} events across India`
            : `Browse ${events.length} upcoming events across India`}
        </p>
      </div>

      <div className="explore-controls">
        <SearchInput
          id="explore-search"
          placeholder="Search events, topics, skills, organizers, venues..."
          value={query}
          onChange={setQuery}
          onSearch={handleSuggestionSelect}
          onClear={() => setQuery('')}
          events={events}
        />
        <select className="explore-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Sort: Date</option>
          <option value="popularity">Sort: Most Registered</option>
          <option value="seats">Sort: Seats Left</option>
        </select>
      </div>

      <CategoryFilter categories={CATEGORIES} active={activeCategory} onChange={setActiveCategory} />

      {filtered.length === 0 ? (
        <div className="card explore-empty">
          <div className="explore-empty-icon">
            <SearchX size={44} />
          </div>
          <h3>No events found</h3>
          <p>
            {query.trim()
              ? `We couldn't find any events matching "${query.trim()}"${
                  activeCategory !== 'All' ? ` in the ${activeCategory} category` : ''
                }.`
              : `No events currently available in the ${activeCategory} category.`}
          </p>
          <div className="explore-empty-actions">
            {query.trim() && (
              <button className="btn btn-secondary" onClick={() => setQuery('')}>
                Clear Search
              </button>
            )}
            {activeCategory !== 'All' && (
              <button className="btn btn-secondary" onClick={() => setActiveCategory('All')}>
                View All Categories
              </button>
            )}
            <button className="btn btn-primary" onClick={handleResetFilters}>
              <RotateCcw size={14} /> Reset All
            </button>
          </div>
        </div>
      ) : (
        <div className="event-grid explore-grid">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  )
}


