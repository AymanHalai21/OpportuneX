import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Building,
  Globe,
  DollarSign,
  Gift,
  Plus,
  X
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../data/events.js'
import CategoryImage from '../components/CategoryImage.jsx'
import './HostEvent.css'

const POPULAR_TAGS = [
  'AI/ML',
  'Web Development',
  'FinTech',
  'Beginner Friendly',
  'Cash Prizes',
  'Certificates',
  'Open Source',
  'Networking',
  'Design & UI',
  'Cloud Computing'
]

export default function HostEvent() {
  const navigate = useNavigate()
  const { createEvent, showToast, user } = useApp()

  const [formData, setFormData] = useState({
    title: '',
    category: 'Hackathon',
    date: '',
    time: '10:00 AM',
    mode: 'in-person', // 'in-person' | 'online' | 'hybrid'
    venue: '',
    capacity: 100,
    isFree: true,
    description: '',
    tagInput: '',
    tags: ['Hackathon', 'Campus']
  })

  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation function
  const validateForm = (data) => {
    const newErrors = {}

    if (!data.title.trim()) {
      newErrors.title = 'Event title is required.'
    } else if (data.title.trim().length < 4) {
      newErrors.title = 'Title must be at least 4 characters.'
    }

    if (!data.category) {
      newErrors.category = 'Please select a category.'
    }

    if (!data.date) {
      newErrors.date = 'Event date is required.'
    }

    if (!data.time.trim()) {
      newErrors.time = 'Start time is required.'
    }

    if (!data.venue.trim()) {
      newErrors.venue = data.mode === 'online' ? 'Meeting link or platform name is required.' : 'Venue location is required.'
    }

    const capacityNum = parseInt(data.capacity, 10)
    if (isNaN(capacityNum) || capacityNum < 5) {
      newErrors.capacity = 'Capacity must be at least 5 attendees.'
    }

    if (!data.description.trim()) {
      newErrors.description = 'Event description is required.'
    } else if (data.description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters to inform attendees.'
    }

    return newErrors
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validationErrors = validateForm(formData)
    setErrors(validationErrors)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const updated = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    }
    setFormData(updated)

    if (touched[name]) {
      const validationErrors = validateForm(updated)
      setErrors(validationErrors)
    }
  }

  const handleCategorySelect = (cat) => {
    const updated = { ...formData, category: cat }
    // Update tags with new category if previous category was in tags
    const newTags = formData.tags.filter((t) => !CATEGORIES.includes(t))
    newTags.unshift(cat)
    updated.tags = Array.from(new Set(newTags))
    setFormData(updated)
  }

  const handleModeSelect = (modeVal) => {
    let newVenue = formData.venue
    if (modeVal === 'online' && (!formData.venue || formData.venue.includes('Campus') || formData.venue.includes('Hall'))) {
      newVenue = 'Online (Zoom / Meet link provided to registrants)'
    } else if (modeVal === 'in-person' && formData.venue.includes('Online')) {
      newVenue = `${user.college || 'Campus Main Auditorium'}, New Delhi`
    }
    setFormData((prev) => ({
      ...prev,
      mode: modeVal,
      venue: newVenue
    }))
  }

  const handleAddTag = (tagToAdd) => {
    const cleanTag = (tagToAdd || formData.tagInput).trim()
    if (cleanTag && !formData.tags.includes(cleanTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, cleanTag],
        tagInput: ''
      }))
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove)
    }))
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      title: true,
      category: true,
      date: true,
      time: true,
      venue: true,
      capacity: true,
      description: true
    })

    const validationErrors = validateForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      showToast('Please correct the highlighted fields before publishing.', 'error')
      // Scroll to first error field
      const firstError = Object.keys(validationErrors)[0]
      const element = document.getElementById(`field-${firstError}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    // Format date string
    let formattedDate = 'Upcoming'
    if (formData.date) {
      try {
        const d = new Date(formData.date + 'T00:00:00')
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } catch {
        formattedDate = formData.date
      }
    }

    const created = createEvent({
      title: formData.title.trim(),
      category: formData.category,
      dateLabel: formattedDate,
      date: formData.date,
      time: formData.time.trim(),
      venue: formData.venue.trim(),
      online: formData.mode === 'online',
      capacity: parseInt(formData.capacity, 10) || 100,
      free: formData.isFree,
      description: formData.description.trim(),
      tags: formData.tags.length > 0 ? formData.tags : [formData.category, 'Campus']
    })

    // Navigate to the organizer dashboard for the new event
    setTimeout(() => {
      navigate(`/dashboard/${created.id}`)
    }, 250)
  }

  return (
    <div className="host-event-page container">
      {/* Top Breadcrumb & Header */}
      <div className="host-event-header">
        <button className="host-event-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={16} /> <span>Back</span>
        </button>

        <div className="host-event-title-group">
          <span className="pill host-event-badge">
            <Sparkles size={13} /> Organizer Hub
          </span>
          <h1>Host a New Campus Event</h1>
          <p className="host-event-subhead">
            Create and publish your hackathon, workshop, seminar, or fest to reach verified students across colleges.
          </p>
        </div>
      </div>

      {/* Main Form & Preview Grid */}
      <div className="host-event-layout">
        <form className="card host-event-form" onSubmit={handleSubmit} noValidate>
          {/* Top Form Alert on Error */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="host-event-error-banner" role="alert">
              <AlertCircle size={18} className="host-error-icon" />
              <div>
                <strong>Please complete all required fields</strong>
                <p>Check the red highlighted inputs below to finish publishing your event.</p>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="host-section">
            <div className="host-section-header">
              <span className="host-section-num">1</span>
              <div>
                <h3>Event Overview</h3>
                <p>Give your event a clear title and assign the correct category.</p>
              </div>
            </div>

            <div className="host-fields">
              <div className="host-field" id="field-title">
                <label className="host-label" htmlFor="title">
                  Event Title <span className="req">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={`host-input ${touched.title && errors.title ? 'host-input--error' : ''}`}
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g. HackSphere 2026 - Pan-India AI Hackathon"
                  maxLength={100}
                />
                {touched.title && errors.title && <span className="host-field-error">{errors.title}</span>}
              </div>

              <div className="host-field" id="field-category">
                <label className="host-label">
                  Category <span className="req">*</span>
                </label>
                <div className="host-category-pills">
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`host-category-btn ${formData.category === cat ? 'active' : ''}`}
                      data-category={cat}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {formData.category === cat && <CheckCircle2 size={13} />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Venue */}
          <div className="host-section">
            <div className="host-section-header">
              <span className="host-section-num">2</span>
              <div>
                <h3>Date, Time &amp; Location</h3>
                <p>Specify when and where your campus attendees should join.</p>
              </div>
            </div>

            <div className="host-fields">
              <div className="host-grid-2">
                <div className="host-field" id="field-date">
                  <label className="host-label" htmlFor="date">
                    <Calendar size={14} /> Event Date <span className="req">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className={`host-input ${touched.date && errors.date ? 'host-input--error' : ''}`}
                    value={formData.date}
                    onChange={handleChange}
                    onBlur={() => handleBlur('date')}
                  />
                  {touched.date && errors.date && <span className="host-field-error">{errors.date}</span>}
                </div>

                <div className="host-field" id="field-time">
                  <label className="host-label" htmlFor="time">
                    <Clock size={14} /> Start Time <span className="req">*</span>
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="text"
                    className={`host-input ${touched.time && errors.time ? 'host-input--error' : ''}`}
                    value={formData.time}
                    onChange={handleChange}
                    onBlur={() => handleBlur('time')}
                    placeholder="e.g. 10:00 AM - 5:00 PM"
                  />
                  {touched.time && errors.time && <span className="host-field-error">{errors.time}</span>}
                </div>
              </div>

              <div className="host-field">
                <label className="host-label">Event Mode</label>
                <div className="host-mode-toggle">
                  <button
                    type="button"
                    className={`host-mode-btn ${formData.mode === 'in-person' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('in-person')}
                  >
                    <Building size={15} />
                    <span>In-Person</span>
                  </button>
                  <button
                    type="button"
                    className={`host-mode-btn ${formData.mode === 'online' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('online')}
                  >
                    <Laptop size={15} />
                    <span>Virtual / Online</span>
                  </button>
                  <button
                    type="button"
                    className={`host-mode-btn ${formData.mode === 'hybrid' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('hybrid')}
                  >
                    <Globe size={15} />
                    <span>Hybrid</span>
                  </button>
                </div>
              </div>

              <div className="host-field" id="field-venue">
                <label className="host-label" htmlFor="venue">
                  <MapPin size={14} /> {formData.mode === 'online' ? 'Meeting Platform / Link' : 'Venue / College Auditorium'} <span className="req">*</span>
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  className={`host-input ${touched.venue && errors.venue ? 'host-input--error' : ''}`}
                  value={formData.venue}
                  onChange={handleChange}
                  onBlur={() => handleBlur('venue')}
                  placeholder={
                    formData.mode === 'online'
                      ? 'e.g. Zoom (Link shared after registration)'
                      : 'e.g. IIT Delhi, Dogra Hall, New Delhi'
                  }
                />
                {touched.venue && errors.venue && <span className="host-field-error">{errors.venue}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Capacity & Pricing */}
          <div className="host-section">
            <div className="host-section-header">
              <span className="host-section-num">3</span>
              <div>
                <h3>Capacity &amp; Ticketing</h3>
                <p>Control registration limits and admission terms.</p>
              </div>
            </div>

            <div className="host-fields">
              <div className="host-grid-2">
                <div className="host-field" id="field-capacity">
                  <label className="host-label" htmlFor="capacity">
                    <Users size={14} /> Total Seat Capacity <span className="req">*</span>
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="5"
                    max="10000"
                    className={`host-input ${touched.capacity && errors.capacity ? 'host-input--error' : ''}`}
                    value={formData.capacity}
                    onChange={handleChange}
                    onBlur={() => handleBlur('capacity')}
                  />
                  {touched.capacity && errors.capacity && (
                    <span className="host-field-error">{errors.capacity}</span>
                  )}
                  <span className="host-field-hint">Maximum number of students admitted.</span>
                </div>

                <div className="host-field">
                  <label className="host-label">Admission Pricing</label>
                  <div className="host-free-card">
                    <label className="host-checkbox-wrapper">
                      <input
                        type="checkbox"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={handleChange}
                        className="host-checkbox"
                      />
                      <div className="host-free-text">
                        <strong>Free Registration for Students</strong>
                        <span>Zero admission fees required from campus attendees.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Tags & Keywords */}
          <div className="host-section">
            <div className="host-section-header">
              <span className="host-section-num">4</span>
              <div>
                <h3>Tags &amp; Keywords</h3>
                <p>Add relevant topics so students can discover your event easily.</p>
              </div>
            </div>

            <div className="host-fields">
              <div className="host-field">
                <label className="host-label" htmlFor="tagInput">
                  <Tag size={14} /> Add Tags
                </label>
                <div className="host-tag-input-row">
                  <input
                    id="tagInput"
                    type="text"
                    className="host-input"
                    value={formData.tagInput}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tagInput: e.target.value }))}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type tag and press Enter (e.g. AI/ML, Beginners)"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary host-add-tag-btn"
                    onClick={() => handleAddTag()}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                {/* Selected Tags List */}
                <div className="host-tags-list">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="host-tag-chip">
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="host-tag-remove"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="host-tag-suggestions">
                  <span className="host-suggestions-label">Popular tags:</span>
                  <div className="host-suggestion-chips">
                    {POPULAR_TAGS.filter((t) => !formData.tags.includes(t)).slice(0, 6).map((suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        className="host-suggestion-btn"
                        onClick={() => handleAddTag(suggested)}
                      >
                        + {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Description & Agenda */}
          <div className="host-section">
            <div className="host-section-header">
              <span className="host-section-num">5</span>
              <div>
                <h3>Description &amp; Agenda</h3>
                <p>Provide full details including prize pools, schedule, prerequisites, and speaker lineup.</p>
              </div>
            </div>

            <div className="host-fields">
              <div className="host-field" id="field-description">
                <label className="host-label" htmlFor="description">
                  <FileText size={14} /> Event Details <span className="req">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  className={`host-input host-textarea ${touched.description && errors.description ? 'host-input--error' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={() => handleBlur('description')}
                  placeholder="Describe your event agenda, rules, prize pool, mentors, and what participants will build or learn..."
                />
                {touched.description && errors.description && (
                  <span className="host-field-error">{errors.description}</span>
                )}
                <span className="host-field-hint">
                  Tip: Mention team sizes, registration deadlines, and certificate eligibility.
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="host-form-actions">
            <button
              type="button"
              className="btn btn-secondary host-cancel-btn"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg host-submit-btn"
              disabled={isSubmitting}
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Publishing Event...' : 'Publish Event & Open Dashboard'}</span>
            </button>
          </div>
        </form>

        {/* Sticky Live Preview Column */}
        <div className="host-event-preview-col">
          <div className="card host-preview-card">
            <div className="host-preview-header">
              <span className="host-preview-live-badge">Live Card Preview</span>
              <span className="host-preview-caption">How students will see your event</span>
            </div>

            <div className="host-preview-event-box">
              <div className="host-preview-img-wrap">
                <CategoryImage category={formData.category} title={formData.title || 'Event Title'} />
                <span className="pill category-pill" data-category={formData.category}>
                  {formData.category}
                </span>
                {formData.mode === 'online' && <span className="pill host-online-pill">Online</span>}
              </div>

              <div className="host-preview-body">
                <h4 className="host-preview-title">
                  {formData.title.trim() || 'Untitled Campus Event'}
                </h4>

                <div className="host-preview-meta">
                  <Calendar size={13} />
                  <span>
                    {formData.date
                      ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Date to be announced'} · {formData.time || '10:00 AM'}
                  </span>
                </div>

                <div className="host-preview-meta">
                  <MapPin size={13} />
                  <span>{formData.venue.trim() || 'Campus Venue, College Campus'}</span>
                </div>

                <div className="host-preview-progress">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '0%' }} />
                  </div>
                  <div className="host-preview-progress-labels">
                    <span>0 registered</span>
                    <span>{formData.capacity || 100} seats left</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="host-preview-organizer-info">
              <div className="host-organizer-avatar">
                {user.name ? user.name.charAt(0) : 'O'}
              </div>
              <div className="host-organizer-text">
                <strong>Hosted by {user.name || 'Student Organizer'}</strong>
                <span>{user.college || 'Verified Campus Partner'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
