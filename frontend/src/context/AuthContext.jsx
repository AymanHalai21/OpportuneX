import { AppProvider, useApp } from './AppContext.jsx'
export function AuthProvider({ children }) { return <AppProvider>{children}</AppProvider> }
export function useAuth() { return useApp() }
