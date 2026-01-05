import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ChallengesPage from './pages/ChallengesPage'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ?? null))
      .finally(() => setInitializing(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (initializing) {
    return (
      <div className="screen-center">
        <div className="loader" />
        <p>Chargement...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="auth-wrapper">
        <div className="glass-card">
          <AuthPage />
        </div>
      </div>
    )
  }

  return (
    <Layout onLogout={handleLogout} userEmail={session.user.email ?? null}>
      <Routes>
        <Route path="/" element={<DashboardPage session={session} />} />
        <Route path="/challenges" element={<ChallengesPage session={session} />} />
        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
