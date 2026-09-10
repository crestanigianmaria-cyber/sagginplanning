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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5 md:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-slate-200">
        <div className="flex flex-col items-center">
          <div className="bg-white p-2 rounded-xl mb-6 shadow-sm">
            <img src="/logo.png" alt="Saggin Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Saggin Planning</h1>
          <p className="text-slate-500 mt-2">Accesso Ufficio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-950 text-red-700 border border-red-900 p-3 rounded-xl text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-slate-500 text-sm font-medium hover:text-slate-900"
              >
                {showPwd ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-900 text-white p-3 rounded-xl font-semibold hover:bg-rose-950 transition-colors disabled:opacity-70"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-200 text-center">
          <Link href="/pin" className="text-slate-500 font-semibold hover:text-slate-900 flex items-center justify-center gap-2 transition-colors">
            Accesso autisti <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
