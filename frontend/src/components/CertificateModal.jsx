import React from 'react'
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './CertificateModal.css'

export default function CertificateModal({ certificate, isOpen, onClose }) {
  const { user, showToast } = useApp()

  if (!isOpen || !certificate) return null

  const handlePrint = () => {
    try {
      window.print()
    } catch {
      showToast('Certificate print dialog opened', 'info')
    }
  }

  const handleShare = async () => {
    const certUrl = `${window.location.origin}/profile?cert=${certificate.certificateId || certificate.id}`
    const shareData = {
      title: `${certificate.certificateTitle || certificate.title} - ${user.name}`,
      text: `${user.name} earned "${certificate.title}" for ${certificate.event} on OpportuneX!`,
      url: certUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(certUrl)
        showToast('Certificate link copied to clipboard!', 'success')
      }
    } catch {
      await navigator.clipboard.writeText(certUrl)
      showToast('Certificate link copied to clipboard!', 'success')
    }
  }

  return (
    <div className="modal-backdrop cert-modal-backdrop" onClick={onClose}>
      <div className="modal-card cert-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="cert-modal-header">
          <div className="cert-modal-title-group">
            <span className="pill cert-header-badge">
              <ShieldCheck size={13} /> Verified Digital Credential
            </span>
            <h3>Certificate Preview</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close certificate preview">
            <X size={18} />
          </button>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="cert-sheet-container">
          <div className="cert-sheet" id="cert-printable-area">
            {/* Decorative Borders */}
            <div className="cert-border-outer">
              <div className="cert-border-inner">
                {/* Certificate Brand Header */}
                <div className="cert-brand">
                  <div className="cert-logo-mark">
                    <div className="cert-crest">
                      <Sparkles size={20} />
                    </div>
                    <div className="cert-brand-text">
                      <span className="cert-brand-name">OPPORTUNEX</span>
                      <span className="cert-brand-sub">CAMPUS MERIT NETWORK</span>
                    </div>
                  </div>
                  <div className="cert-id-badge">
                    <span>ID: {certificate.certificateId || 'OX-CERT-2025-0841'}</span>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="cert-main-heading">
                  <span className="cert-type-kicker">PROUDLY PRESENTED FOR EXCELLENCE</span>
                  <h1 className="cert-title">
                    {certificate.certificateTitle || 'Certificate of Achievement'}
                  </h1>
                </div>

                {/* Recipient Details */}
                <div className="cert-recipient-section">
                  <p className="cert-for-text">This is to certify that</p>
                  <h2 className="cert-recipient-name">{user.name || 'Arjun Sharma'}</h2>
                  <p className="cert-recipient-college">
                    {user.college || 'IIT Delhi'} · {user.program || 'Student'}
                  </p>
                </div>

                {/* Accomplishment Details */}
                <div className="cert-achievement-text">
                  <p>
                    has demonstrated outstanding performance and accomplishment as{' '}
                    <strong>{certificate.subtitle || certificate.title}</strong> in{' '}
                    <strong className="cert-event-highlight">{certificate.event || 'Campus Event'}</strong>.
                  </p>
                  {certificate.description && (
                    <p className="cert-desc-sub">{certificate.description}</p>
                  )}
                </div>

                {/* Metadata & Signatures Grid */}
                <div className="cert-footer-grid">
                  <div className="cert-meta-item">
                    <span className="cert-meta-label">Category</span>
                    <span className="pill category-pill cert-cat-pill" data-category={certificate.category}>
                      {certificate.category || 'General'}
                    </span>
                  </div>

                  <div className="cert-meta-item cert-seal-item">
                    <div className="cert-seal">
                      <Award size={28} className="cert-seal-icon" />
                      <span>VERIFIED</span>
                    </div>
                  </div>

                  <div className="cert-meta-item cert-sign-item">
                    <div className="cert-signature-line" />
                    <span className="cert-meta-label">Issuing Authority</span>
                    <span className="cert-meta-val">{certificate.issuer || 'Campus Organizer Council'}</span>
                    <span className="cert-meta-date">Date: {certificate.dateEarned || 'August 2025'}</span>
                  </div>
                </div>

                {/* Watermark & Security Notice */}
                <div className="cert-security-footer">
                  <div className="cert-security-tag">
                    <CheckCircle2 size={12} />
                    <span>Cryptographically verified on OpportuneX student ledger</span>
                  </div>
                  <span className="cert-disclaimer">
                    Demo credential for academic and portfolio demonstration purposes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="cert-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={handleShare}>
            <Share2 size={15} /> Share Credential
          </button>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            <Download size={15} /> Print / Save PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
