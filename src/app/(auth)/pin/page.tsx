'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type Driver = {
  id: string
  name: string
  initials: string
}

export default function PinLoginPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/drivers/list')
      .then(r => r.json())
      .then(data => {
        // Handle both format shapes just in case
        if (data.success && data.data) {
           setDrivers(data.data)
        } else if (Array.isArray(data)) {
           setDrivers(data)
        }
      })
      .catch(console.error)
  }, [])

  const handleKeyPress = (key: string) => {
    if (error) {
      setError(false)
      setPin('')
    }
    
    if (key === 'back') {
      setPin(prev => prev.slice(0, -1))
      return
    }

    if (pin.length < 4) {
      const newPin = pin + key
      setPin(newPin)
      
      if (newPin.length === 4) {
        submitPin(newPin)
      }
    }
  }

  const submitPin = async (finalPin: string) => {
    setLoading(true)
    try {
      console.log('Submitting PIN for driver:', selectedDriver?.id)
      const res = await signIn('driver-login', {
        driverId: selectedDriver?.id,
        pin: finalPin,
        redirect: false
      })
      
      console.log('SignIn response:', res)
      if (res?.error) {
        setError(true)
        setPin('')
      } else if (res?.ok) {
        // Successful login
        router.push('/my-trips')
        router.refresh()
      } else {
        setError(true)
        setPin('')
      }
    } catch (e) {
      console.error('Login error:', e)
      setError(true)
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedDriver) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-900 flex flex-col">
        <h1 className="text-3xl font-bold mt-12 mb-8 text-center">Chi sei?</h1>
        <div className="space-y-4 flex-1">
          {drivers.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDriver(d)}
              className="w-full bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex items-center gap-6 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-[#dc2626] text-white text-2xl font-bold flex items-center justify-center">
                {d.initials || d.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-2xl font-medium">{d.name}</span>
            </button>
          ))}
          {drivers.length === 0 && (
            <div className="flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-[#dc2626] border-t-transparent rounded-full"></div></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 flex flex-col items-center justify-center relative">
      <button 
        onClick={() => { setSelectedDriver(null); setPin(''); setError(false); }}
        className="absolute top-8 left-6 text-gray-900/70 font-medium text-lg active:text-gray-900"
      >
        ← Indietro
      </button>

      <div className="mb-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#dc2626] text-white text-3xl font-bold flex items-center justify-center mb-6 shadow-lg">
          {selectedDriver.initials || selectedDriver.name.substring(0, 2).toUpperCase()}
        </div>
        <h2 className="text-3xl font-medium">Ciao, {selectedDriver.name}</h2>
        <p className="text-gray-900/60 mt-2">Inserisci il tuo PIN</p>
      </div>

      <div className={`flex gap-6 mb-16 ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-6 h-6 rounded-full border-2 transition-colors duration-200 ${
              pin.length > i 
                ? 'bg-[#dc2626] border-[#dc2626]' 
                : error ? 'border-red-500' : 'border-white/30'
            }`} 
          />
        ))}
      </div>

      {error && <div className="text-red-700 mb-8 font-medium">PIN errato, riprova</div>}
      {loading && <div className="text-gray-900 mb-8 font-medium">Accesso in corso...</div>}

      <div className="grid grid-cols-3 gap-x-12 gap-y-8 w-full max-w-[320px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="w-[72px] h-[72px] rounded-full bg-white/10 text-3xl font-medium flex items-center justify-center active:bg-white/30 transition-colors mx-auto"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleKeyPress('0')}
          className="w-[72px] h-[72px] rounded-full bg-white/10 text-3xl font-medium flex items-center justify-center active:bg-white/30 transition-colors mx-auto"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('back')}
          className="w-[72px] h-[72px] rounded-full bg-transparent text-gray-900/70 text-xl font-medium flex items-center justify-center active:text-gray-900 transition-colors mx-auto"
        >
          ⌫
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
        
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}
