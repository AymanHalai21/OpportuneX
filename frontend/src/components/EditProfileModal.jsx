import React, { useState } from 'react'
import { X, User, Mail, GraduationCap, Building2, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './EditProfileModal.css'

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useApp()

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    college: user.college || '',
    program: user.program || '',
    year: user.year || '3rd Year'
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateUserProfile(formData)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="edit-profile-body">
            <label>
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Arjun Sharma"
              />
            </label>

            <label>
              <span>College / University Email</span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. arjun@iitd.ac.in"
              />
            </label>

            <label>
              <span>College Name</span>
              <input
                type="text"
                name="college"
                required
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. IIT Delhi"
              />
            </label>

            <div className="edit-profile-row">
              <label>
                <span>Program / Degree</span>
                <input
                  type="text"
                  name="program"
                  required
                  value={formData.program}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </label>

              <label>
                <span>Year of Study</span>
                <select name="year" value={formData.year} onChange={handleChange}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="PhD Scholar">PhD Scholar</option>
                </select>
              </label>
            </div>
          </div>

          <div className="modal-footer edit-profile-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
