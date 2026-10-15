import React, { useState } from 'react'
import { X, QrCode, Camera, Check, UserCheck, AlertCircle, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './ScannerModal.css'

export default function ScannerModal({ event, isOpen, onClose }) {
  const { checkInByTicketCode, toggleCheckInAttendee } = useApp()
  const [ticketInput, setTicketInput] = useState('')
  const [activeTab, setActiveTab] = useState('camera') // 'camera' | 'manual'
  const [scannedResult, setScannedResult] = useState(null)
  const [simulating, setSimulating] = useState(false)

  if (!isOpen || !event) return null

  const handleSimulateScan = () => {
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      // Pick random attendee or generate ticket
      const unChecked = event.dashboard?.attendees?.filter((a) => a.status !== 'Checked In') || []
      const targetAttendee = unChecked.length > 0 ? unChecked[0].name : 'Priya Menon'
      const code = 'OX-' + Math.floor(1000 + Math.random() * 9000)
      checkInByTicketCode(event.id, code, targetAttendee)
      setScannedResult({
        name: targetAttendee,
        code,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    }, 1200)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!ticketInput.trim()) return
    const code = ticketInput.trim().toUpperCase()
    checkInByTicketCode(event.id, code, `Attendee (${code})`)
    setScannedResult({
      name: `Ticket Holder (${code})`,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    setTicketInput('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="scanner-header-title">
            <QrCode size={20} className="scanner-icon" />
            <div>
              <h3>QR Ticket Scanner</h3>
              <p>{event.title}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close scanner">
            <X size={18} />
          </button>
        </div>

        <div className="scanner-tabs">
          <button
            className={`scanner-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={16} /> Live Scanner
          </button>
          <button
            className={`scanner-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <UserCheck size={16} /> Manual Code Entry
          </button>
        </div>

        <div className="scanner-body">
          {activeTab === 'camera' ? (
            <div className="scanner-camera-view">
              <div className="scanner-viewfinder">
                <div className="scanner-laser" />
                <div className="scanner-corner scanner-corner-tl" />
                <div className="scanner-corner scanner-corner-tr" />
                <div className="scanner-corner scanner-corner-bl" />
                <div className="scanner-corner scanner-corner-br" />
                <QrCode size={110} className="scanner-target-icon" />
              </div>
              <p className="scanner-hint">Align attendee's mobile QR code within the frame</p>

              <button
                className="btn btn-primary scanner-simulate-btn"
                disabled={simulating}
                onClick={handleSimulateScan}
              >
                {simulating ? (
                  <>
                    <RefreshCw size={16} className="spinning" /> Scanning Ticket...
                  </>
                ) : (
                  <>
                    <Camera size={16} /> Simulate QR Scan
                  </>
                )}
              </button>
            </div>
          ) : (
            <form className="scanner-manual-form" onSubmit={handleManualSubmit}>
              <label htmlFor="ticket-code-input">Enter Attendee Ticket ID or Reference Number</label>
              <div className="scanner-input-row">
                <input
                  id="ticket-code-input"
                  type="text"
                  placeholder="e.g. OX-8492 or Student Name"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Check In
                </button>
              </div>
              <p className="scanner-hint">Manual entry is logged to the attendance dashboard instantly.</p>
            </form>
          )}

          {scannedResult && (
            <div className="scanner-success-card">
              <div className="scanner-success-badge">
                <Check size={18} />
              </div>
              <div className="scanner-success-info">
                <strong>{scannedResult.name}</strong>
                <span>Ticket Code: {scannedResult.code} · Admitted at {scannedResult.time}</span>
              </div>
            </div>
          )}

          <div className="scanner-recent-list">
            <h4>Quick Check-in from List</h4>
            <div className="scanner-attendee-chips">
              {event.dashboard?.attendees?.map((att) => (
                <button
                  key={att.name}
                  type="button"
                  className={`scanner-chip ${att.status === 'Checked In' ? 'scanner-chip--checked' : ''}`}
                  onClick={() => toggleCheckInAttendee(event.id, att.name)}
                >
                  <span>{att.name}</span>
                  <small>{att.status === 'Checked In' ? '✓ Checked In' : '+ Check In'}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-block" onClick={onClose}>
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  )
}
