import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from './AppLayout.jsx'

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user, refresh } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // signed in, but the backend could not be reached so no profile was loaded: show a retry screen instead of crashing
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <h2>Cannot reach the server</h2>
          <p>Please check that the backend is running, then try again.</p>
          <button onClick={refresh} style={{ marginTop: 12, padding: '10px 20px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
