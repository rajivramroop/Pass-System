import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr(''); setOk(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (clean.length < 2) throw new Error('Pick a username (letters, numbers, underscores).')
        // Check availability up front for a friendlier message.
        const { data: free } = await supabase.rpc('username_available', { p_username: clean })
        if (free === false) throw new Error('That username is already taken.')

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: clean } },
        })
        if (error) throw error
        if (!data.session) {
          setOk('Account created. Check your email to confirm, then sign in.')
          setMode('signin')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="seal">P</div>
        <h1>The Pass <em>Registry</em></h1>
        <p className="tagline">A private ledger of favours. Mint your own passes; trade everyone else's.</p>

        {err && <div className="notice err">{err}</div>}
        {ok && <div className="notice ok">{ok}</div>}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Username — your passes will bear this name</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alyssa"
                autoComplete="username"
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="switch">
          {mode === 'signin' ? (
            <>New here? <button className="linkbtn" onClick={() => { setMode('signup'); setErr(''); setOk('') }}>Create an account</button></>
          ) : (
            <>Already a member? <button className="linkbtn" onClick={() => { setMode('signin'); setErr(''); setOk('') }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
