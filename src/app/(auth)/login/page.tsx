'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('office-login', {
      email,
      password,
      redirect: false
    })

    if (res?.error) {
      setError('Credenziali non valide')
      setLoading(false)
    } else {
      router.push('/planning')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-saggin-bg)] flex items-center justify-center p-5 md:p-6">
      <div className="max-w-md w-full bg-[var(--color-saggin-surface)] rounded-2xl shadow-xl p-8 space-y-8 border border-[var(--color-saggin-border)]">
        <div className="flex flex-col items-center">
          <div className="bg-[var(--color-saggin-surface)] p-2 rounded-xl mb-6 ">
            <img src="/logo.png" alt="Saggin Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-saggin-text-primary)]">Saggin Planning</h1>
          <p className="text-[var(--color-saggin-text-secondary)] mt-2">Accesso Ufficio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-950 text-red-700 border border-red-900 p-3 rounded-xl text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-saggin-text-secondary)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] rounded-xl focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-saggin-text-secondary)] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] rounded-xl focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-[var(--color-saggin-text-secondary)] text-sm font-medium hover:text-[var(--color-saggin-text-primary)]"
              >
                {showPwd ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-brand-red)] text-white p-3 rounded-xl font-semibold hover:bg-[#b91c1c] transition-colors disabled:opacity-70"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="pt-6 border-t border-[var(--color-saggin-border)] flex items-center justify-between text-xs">
          <Link href="/pin" className="text-[var(--color-saggin-text-secondary)] font-semibold hover:text-[var(--color-saggin-text-primary)] flex items-center gap-1.5 transition-colors">
            Accesso autisti <span>→</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            Torna al portale
          </Link>
        </div>

        {/* SUITE AZIENDALE SAGGIN — COLLEGAMENTO RAPIDO ORDINI / MAGAZZINO */}
        <div className="pt-2">
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-saggin-border)]" />
            </div>
            <div className="relative bg-[var(--color-saggin-surface)] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suite Aziendale Saggin
            </div>
          </div>

          <a
            href="https://comunicazione.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-bg)] hover:bg-slate-50 hover:border-[var(--color-brand-red)]/60 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white border border-[var(--color-saggin-border)] p-1.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-red-200 transition-colors">
                <img src="/logo.png" alt="Saggin Logo" className="w-full h-full object-contain" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)] group-hover:text-[var(--color-brand-red)] transition-colors">
                    Ordini
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-100 text-[var(--color-brand-red)] border border-red-200">
                    Esterno
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-saggin-text-secondary)] truncate mt-0.5">
                  Portale Magazzino &amp; Ordini clienti (Comunicazione)
                </p>
              </div>

              <div className="w-7 h-7 rounded-lg bg-white border border-[var(--color-saggin-border)] flex items-center justify-center text-slate-400 group-hover:text-[var(--color-brand-red)] group-hover:border-red-200 transition-all shrink-0">
                <span className="text-xs font-bold">↗</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
