import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import './Toast.css'

export default function Toast() {
  const { toast, hideToast } = useApp()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      hideToast()
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon toast-icon--success" />
      case 'error':
        return <AlertCircle size={18} className="toast-icon toast-icon--error" />
      default:
        return <Info size={18} className="toast-icon toast-icon--info" />
    }
  }

  return (
    <div className={`toast-container toast--${toast.type || 'info'}`} role="status" aria-live="polite">
      {getIcon()}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={hideToast} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  )
}
