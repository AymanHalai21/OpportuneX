import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Zap, Home, Search, ClipboardList, User, Menu, X, Flame, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserAvatar, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatar.js'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, getJoinedEvents } = useAuth()
  const navigate = useNavigate()

  const joinedCount = getJoinedEvents().length

  const navItems = [
    { to: '/discover', label: 'Discover', icon: Home },
    { to: '/explore', label: 'Explore', icon: Search },
    { to: '/my-events', label: 'My Events', icon: ClipboardList, badge: joinedCount > 0 ? joinedCount : null },
    { to: '/profile', label: 'Profile', icon: User }
  ]

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-row container">
        <NavLink to="/discover" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-logo">
            <Zap size={16} fill="currentColor" />
          </span>
          OpportuneX
        </NavLink>

        <nav className="navbar-links navbar-links--desktop">
          {navItems.map(({ to, label, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              {label}
              {badge ? <span className="navbar-link-badge">{badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions navbar-actions--desktop">
          <button className="btn btn-primary" onClick={() => navigate('/host-event')}>
            <Flame size={16} />
            Host New Event
          </button>
          <NavLink to="/profile" className="navbar-profile">
            <img
              src={getUserAvatar(user)}
              alt={user.name}
              className="navbar-avatar"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_NEUTRAL_AVATAR
              }}
            />
            <span className="navbar-profile-text">
              <strong>{user.name}</strong>
              <small>{user.college}</small>
            </span>
          </NavLink>
        </div>

        <button
          className="navbar-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="navbar-drawer">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) => `navbar-drawer-item${isActive ? ' active' : ''}`}
            >
              <span className="navbar-drawer-item-left">
                <Icon size={18} />
                {label}
              </span>
              {badge ? <span className="navbar-drawer-dot" /> : <ChevronRight size={16} className="navbar-drawer-chevron" />}
            </NavLink>
          ))}
          <button className="navbar-drawer-item navbar-drawer-item--action" onClick={() => { closeMenu(); navigate('/host-event') }}>
            <span className="navbar-drawer-item-left">
              <Flame size={18} />
              Host New Event
            </span>
          </button>
          <button className="navbar-drawer-item navbar-drawer-item--danger" onClick={handleLogout}>
            <span className="navbar-drawer-item-left">
              <LogOut size={18} />
              Log Out
            </span>
          </button>
        </nav>
      )}
    </header>
  )
}

