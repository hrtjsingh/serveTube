'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

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
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-1">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'login' ? 'Sign in to sync your playlist across devices.' : 'Join ServeTube — free forever.'}
          </p>
        </div>

        {/* Tab bar */}
        <div className="mt-5 mb-6 flex rounded-lg bg-muted p-1 gap-1">
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

        {/* Fields */}
        <div className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
            <input
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-11 text-sm outline-none focus:border-[#f8bf59] transition-colors placeholder:text-muted-foreground"
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
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#f8bf59] px-5 py-2 text-sm font-bold text-[#070707] hover:bg-[#ffe49f] transition-colors disabled:opacity-60 shadow-sm"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Switch */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
            className="font-semibold text-foreground hover:text-[#f8bf59] transition-colors underline underline-offset-2"
          >
            {tab === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
