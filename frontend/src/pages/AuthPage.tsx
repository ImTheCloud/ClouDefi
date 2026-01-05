import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button, Card, Field, Input } from '../components/UI'

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Compte créé. Vérifie tes emails si besoin puis connecte-toi.')
        setMode('login')
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Challenges Planner</p>
      <h1>Connecte-toi pour démarrer la semaine</h1>
      <p className="muted">
        Email + mot de passe. Les données restent privées grâce au RLS Supabase.
      </p>
      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'tab active' : 'tab'}
          onClick={() => setMode('login')}
          type="button"
        >
          Connexion
        </button>
        <button
          className={mode === 'register' ? 'tab active' : 'tab'}
          onClick={() => setMode('register')}
          type="button"
        >
          Inscription
        </button>
      </div>
      <Card>
        <form className="stack" onSubmit={handleSubmit}>
          <Field label="Email">
            <Input
              required
              type="email"
              placeholder="toi@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mot de passe" hint="8 caractères minimum">
            <Input
              required
              type="password"
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {message && <p className="error">{message}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Patiente...' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default AuthPage
