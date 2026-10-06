import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Router from './routes/router'
import axiosInstance from './api/axios-instance'
import { useAuthStore, type AuthUser } from './store/auth.store'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue" />
    </div>
  )
}

function App() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(accessToken))

  useEffect(() => {
    if (!accessToken) {
      return
    }

    let cancelled = false

    axiosInstance
      .get<AuthUser>('/auth/me')
      .then((response) => {
        if (cancelled) return
        const { accessToken: currentAccessToken, refreshToken } = useAuthStore.getState()
        login(response.data, currentAccessToken!, refreshToken!)
      })
      .catch(() => {
        if (cancelled) return
        logout()
      })
      .finally(() => {
        if (cancelled) return
        setIsCheckingSession(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isCheckingSession) {
    return <FullScreenSpinner />
  }

  return <Router />
}

export default App
