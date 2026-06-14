'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (tab === 'register' && name.trim().length < 2) { setError('Enter your name'); return }
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(name.trim(), email, password)
      }
      onClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError(err?.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="st-modal-overlay z-[200]"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="st-modal-panel max-w-md p-8">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X size={18} />
        </button>

        <div className="mb-1">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'login'
              ? 'Sign in to sync your playlists across devices.'
              : 'Join ServeTube — ad-free YouTube, free forever.'}
          </p>
        </div>

        <div className="mt-5 mb-6 flex gap-1 rounded-lg bg-muted p-1">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="st-label">Full Name</label>
              <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="st-label">Email</label>
            <Input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="st-label">Password</label>
            <div className="relative">
              <Input
                className="pr-11"
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="brand" onClick={submit} disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
            className="font-semibold text-foreground underline underline-offset-2 transition-colors hover:text-brand"
          >
            {tab === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
