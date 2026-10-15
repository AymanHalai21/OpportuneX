import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  X,
  Plus,
  Edit3,
  Share2,
  Award,
  ShieldCheck,
  Calendar,
  FileCheck,
  Eye,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import CategoryImage from '../components/CategoryImage.jsx'
import EditProfileModal from '../components/EditProfileModal.jsx'
import CertificateModal from '../components/CertificateModal.jsx'
import { getUserAvatar, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatar.js'
import './Profile.css'

const ACCOUNT_LINKS = ['Settings', 'Notification Preferences', 'Privacy', 'Help & Support']

export default function Profile() {
  const { user, events, logout, addInterest, removeInterest, setActiveAccountModal, showToast } = useAuth()
  const navigate = useNavigate()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)
  const [badgeFilter, setBadgeFilter] = useState('all') // 'all' | 'certificates'
  const [interestInput, setInterestInput] = useState('')
  const [addingInterest, setAddingInterest] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleShareProfile = async () => {
    const shareData = {
      title: `${user.name} on OpportuneX`,
      text: `Check out ${user.name}'s profile on OpportuneX (${user.college})`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Profile link copied to clipboard!', 'success')
      }
    } catch {
      showToast('Profile link copied to clipboard!', 'success')
    }
  }

  const handleAddInterestSubmit = (e) => {
    e.preventDefault()
    if (interestInput.trim()) {
      addInterest(interestInput.trim())
      setInterestInput('')
      setAddingInterest(false)
    }
  }

  const badgesList = user.badges || []
  const certificatesCount = badgesList.filter((b) => b.hasCertificate).length
  const displayedBadges =
    badgeFilter === 'certificates'
      ? badgesList.filter((b) => b.hasCertificate)
      : badgesList

  return (
    <div className="profile-page">
      <div className="profile-cover" />

      <div className="container profile-header">
        <div className="profile-header-main">
          <img
            src={getUserAvatar(user)}
            alt={user.name}
            className="profile-avatar"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_NEUTRAL_AVATAR
            }}
          />
          <div className="profile-header-text">
            <h1>{user.name}</h1>
            <p>
              {user.program} · {user.college} · {user.year}
            </p>
          </div>
        </div>
        <div className="profile-header-actions">
          <button className="btn btn-primary" onClick={() => setEditModalOpen(true)}>
            <Edit3 size={15} /> Edit Profile
          </button>
          <button className="btn btn-secondary" onClick={handleShareProfile}>
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>

      <div className="container profile-stats">
        <div className="profile-stat-card">
          <strong>{user.stats?.eventsJoined ?? 0}</strong>
          <span>Events Joined</span>
        </div>
        <div className="profile-stat-card">
          <strong>{user.stats?.eventsHosted ?? 0}</strong>
          <span>Events Hosted</span>
        </div>
        <div className="profile-stat-card">
          <strong>{user.stats?.badgesEarned ?? badgesList.length}</strong>
          <span>Badges Earned</span>
        </div>
        <div className="profile-stat-card">
          <strong>{user.stats?.xpPoints ?? 1250}</strong>
          <span>XP Points</span>
        </div>
      </div>

      <div className="container profile-grid">
        <div className="profile-main">
          {/* Interests Section */}
          <div className="card profile-section">
            <div className="profile-section-header">
              <h3>Interests</h3>
              {!addingInterest && (
                <button
                  type="button"
                  className="profile-add-interest"
                  onClick={() => setAddingInterest(true)}
                >
                  <Plus size={14} /> Add interest
                </button>
              )}
            </div>

            <div className="profile-interests">
              {user.interests.map((interest) => (
                <span key={interest} className="profile-interest-pill">
                  {interest}
                  <button
                    type="button"
                    className="profile-interest-remove"
                    onClick={() => removeInterest(interest)}
                    title={`Remove ${interest}`}
                    aria-label={`Remove ${interest}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0 0 0 6px',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: 0.7
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {addingInterest && (
              <form onSubmit={handleAddInterestSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  placeholder="e.g. Robotics, UI/UX"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAddingInterest(false)}
                  style={{ padding: '8px 12px' }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Event History */}
          <div className="card profile-section">
            <h3>Event History</h3>
            <div className="profile-history">
              {events.slice(0, 4).map((ev) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="profile-history-row"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="profile-history-thumb">
                    <CategoryImage category={ev.category} image={ev.banner || ev.image} title={ev.title} />
                  </div>
                  <div className="profile-history-text">
                    <strong>{ev.title}</strong>
                    <span>
                      {ev.dateLabel} · {ev.venue}
                    </span>
                  </div>
                  <span className="pill category-pill" data-category={ev.category}>
                    {ev.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="profile-side">
          {/* Badges & Certificates Section */}
          <div className="card profile-section profile-badges-section">
            <div className="profile-section-header profile-badges-header">
              <div>
                <h3>Badges &amp; Certificates</h3>
                <span className="profile-badges-subhead">Verified campus accomplishments</span>
              </div>

              {/* Segmented Filter */}
              <div className="profile-badge-tabs">
                <button
                  type="button"
                  className={`profile-badge-tab-btn ${badgeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBadgeFilter('all')}
                >
                  All ({badgesList.length})
                </button>
                <button
                  type="button"
                  className={`profile-badge-tab-btn ${badgeFilter === 'certificates' ? 'active' : ''}`}
                  onClick={() => setBadgeFilter('certificates')}
                >
                  Certificates ({certificatesCount})
                </button>
              </div>
            </div>

            {/* Badges List */}
            <div className="profile-badges-list">
              {displayedBadges.map((badge) => {
                const title = badge.title || badge.label
                const emoji = badge.emoji || '🎖️'
                const hasCert = badge.hasCertificate

                return (
                  <div
                    key={badge.id || title}
                    className={`profile-badge-card ${hasCert ? 'profile-badge-card--with-cert' : ''}`}
                  >
                    <div className="profile-badge-top">
                      <div className="profile-badge-icon-box">
                        <span className="profile-badge-emoji">{emoji}</span>
                      </div>

                      <div className="profile-badge-info">
                        <div className="profile-badge-title-row">
                          <strong className="profile-badge-title">{title}</strong>
                          {badge.type && (
                            <span className="profile-badge-type-pill">{badge.type}</span>
                          )}
                        </div>

                        {badge.subtitle && (
                          <span className="profile-badge-subtitle">{badge.subtitle}</span>
                        )}

                        <div className="profile-badge-meta">
                          {badge.event && <span>{badge.event}</span>}
                          {badge.dateEarned && (
                            <>
                              <span>·</span>
                              <span>{badge.dateEarned}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Action */}
                    {hasCert && (
                      <div className="profile-badge-cert-action">
                        <button
                          type="button"
                          className="profile-view-cert-btn"
                          onClick={() => setSelectedCert(badge)}
                          aria-label={`View certificate for ${title}`}
                        >
                          <Award size={13} />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Account Settings */}
          <div className="card profile-section">
            <h3>Account</h3>
            <div className="profile-account-links">
              {ACCOUNT_LINKS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="profile-account-link"
                  onClick={() => setActiveAccountModal(label)}
                >
                  {label} <ChevronRight size={15} />
                </button>
              ))}
              <button
                type="button"
                className="profile-account-link profile-account-link--danger"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />

      {/* Certificate Preview Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  )
}
