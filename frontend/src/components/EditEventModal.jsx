import React, { useState } from 'react'
import { X, Calendar, MapPin, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../data/events.js'
import './EditEventModal.css'

export default function EditEventModal({ event, isOpen, onClose }) {
  const { updateEvent } = useApp()

  const [formData, setFormData] = useState({
    title: event?.title || '',
    category: event?.category || 'Hackathon',
    dateLabel: event?.dateLabel || '',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.venue || '',
    capacity: event?.capacity || 100,
    description: event?.description || '',
    tags: event?.tags ? event.tags.join(', ') : ''
  })

  if (!isOpen || !event) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    updateEvent(event.id, {
      title: formData.title,
      category: formData.category,
      dateLabel: formData.dateLabel || formData.date,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      capacity: parseInt(formData.capacity, 10) || event.capacity,
      description: formData.description,
      tags: tagsArray.length > 0 ? tagsArray : event.tags
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card edit-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Event Details</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="edit-event-body">
            <label>
              <span>Event Title</span>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. HackSphere 2025"
              />
            </label>

            <div className="edit-event-row">
              <label>
                <span>Category</span>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Total Capacity</span>
                <input
                  type="number"
                  name="capacity"
                  min={event.registered || 1}
                  required
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="edit-event-row">
              <label>
                <span>Display Date</span>
                <input
                  type="text"
                  name="dateLabel"
                  value={formData.dateLabel}
                  onChange={handleChange}
                  placeholder="e.g. Sep 14–15, 2025"
                  required
                />
              </label>

              <label>
                <span>Time</span>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 9:00 AM"
                  required
                />
              </label>
            </div>

            <label>
              <span>Venue</span>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. IIT Delhi, Main Auditorium"
                required
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Details about the event..."
              />
            </label>

            <label>
              <span>Tags (comma-separated)</span>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="AI/ML, FinTech, Open Source"
              />
            </label>
          </div>

          <div className="modal-footer edit-event-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
