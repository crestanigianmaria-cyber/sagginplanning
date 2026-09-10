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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-8 border border-zinc-800">
        <div className="flex flex-col items-center">
          <div className="bg-white p-2 rounded-xl mb-6 shadow-lg">
            <img src="/logo.png" alt="Saggin Logo" className="h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Saggin Planning</h1>
          <p className="text-zinc-400 mt-2">Accesso Ufficio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-950 text-red-400 border border-red-900 p-3 rounded-lg text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-zinc-950 border border-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent outline-none pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-zinc-500 text-sm font-medium hover:text-white"
              >
                {showPwd ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#dc2626] text-white p-3 rounded-lg font-bold hover:bg-[#b91c1c] transition-colors disabled:opacity-70"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="pt-6 border-t border-zinc-800 text-center">
          <Link href="/pin" className="text-zinc-400 font-semibold hover:text-white flex items-center justify-center gap-2 transition-colors">
            Accesso autisti <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
