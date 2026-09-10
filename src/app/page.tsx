'use client'
import Link from 'next/link'
import { Building2, Truck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#b91c1c]/10 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <div className="bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-10">
          <img src="/logo.png" alt="Saggin Logo" className="h-16 md:h-20 object-contain" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-center">Portale Operativo</h1>
        <p className="text-slate-500 mb-16 text-center text-lg max-w-lg">
          Seleziona la tua area di competenza per accedere al sistema di gestione.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Ufficio Card */}
          <Link href="/login" className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-rose-900 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-900/5 rounded-bl-full -z-10 group-hover:bg-rose-900/10 transition-colors" />
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-900 transition-colors shadow-sm">
              <Building2 className="w-8 h-8 text-slate-700 group-hover:text-slate-900" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Accesso Ufficio</h2>
            <p className="text-slate-500 text-sm">
              Gestione planning, assegnazione viaggi, controllo mezzi e statistiche avanzate.
            </p>
            <div className="mt-8 flex items-center text-rose-900 font-semibold text-sm group-hover:text-[#ff4d4d]">
              Accedi con Password <span>→</span>
            </div>
          </Link>

          {/* Autista Card */}
          <Link href="/pin" className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-rose-900 transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-900/5 rounded-bl-full -z-10 group-hover:bg-rose-900/10 transition-colors" />
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-900 transition-colors shadow-sm">
              <Truck className="w-8 h-8 text-slate-700 group-hover:text-slate-900" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Accesso Autisti</h2>
            <p className="text-slate-500 text-sm">
              Visualizzazione viaggi assegnati, consuntivazione ore e stato consegne.
            </p>
            <div className="mt-8 flex items-center text-rose-900 font-semibold text-sm group-hover:text-[#ff4d4d]">
              Accedi con PIN <span>→</span>
            </div>
          </Link>
        </div>
        
      </div>
      
      <div className="absolute bottom-6 text-slate-500 text-xs font-medium">
        Saggin Planning System v2.0
      </div>
    </div>
  )
}
