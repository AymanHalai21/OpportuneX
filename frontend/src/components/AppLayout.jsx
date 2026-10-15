import { HelpCircle } from 'lucide-react'
import Navbar from './Navbar.jsx'
import Toast from './Toast.jsx'
import AccountModal from './AccountModal.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function AppLayout({ children }) {
  const { setActiveAccountModal } = useApp()

  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
      <button
        className="help-fab"
        aria-label="Help & support"
        onClick={() => setActiveAccountModal('Help & Support')}
      >
        <HelpCircle size={20} />
      </button>
      <AccountModal />
      <Toast />
    </div>
  )
}

