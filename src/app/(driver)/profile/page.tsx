'use client'
import React, { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, Truck, Phone, Shield, LogOut, CheckCircle, Clock } from 'lucide-react'
import { getDriverAvatar } from '@/lib/utils'

export default function DriverProfilePage() {
  const { data: session } = useSession()
  const [driverData, setDriverData] = useState<any>(null)
  const [stats, setStats] = useState({ totalTrips: 0, totalHours: '0.0' })
  const [loading, setLoading] = useState(true)

  const driverId = (session?.user as any)?.id
  const driverName = session?.user?.name || 'Autista'
  const avatar = getDriverAvatar(driverName, (session?.user as any)?.profilePicture)

  useEffect(() => {
    if (!driverId) return
    Promise.all([
      fetch(`/api/drivers/${driverId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/trips?driverId=${driverId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/manual-hours?driverId=${driverId}`).then(r => r.json()).catch(() => null)
    ]).then(([driverRes, tripsRes, manualRes]) => {
      if (driverRes?.success && driverRes?.data) {
        setDriverData(driverRes.data)
      }
      const trips = tripsRes?.success && Array.isArray(tripsRes.data) ? tripsRes.data : []
      const manual = manualRes?.success && Array.isArray(manualRes.data) ? manualRes.data : []
      
      const completedTrips = trips.filter((t: any) => t.status === 'COMPLETATO')
      const tripMins = completedTrips.reduce((s: number, t: any) => s + (t.workedMinutes || 0), 0)
      const manualMins = manual.reduce((s: number, m: any) => s + (m.minutes || 0), 0)
      
      setStats({
        totalTrips: completedTrips.length,
        totalHours: ((tripMins + manualMins) / 60).toFixed(1)
      })
      setLoading(false)
    })
  }, [driverId])

  return (
    <div className="p-4 space-y-5 font-sans max-w-lg mx-auto pb-24">
      {/* HEADER PROFILO CON FOTO GIGANTE */}
      <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-6 border border-[var(--color-saggin-border)] flex flex-col items-center text-center shadow-xs">
        <div className="relative mb-3">
          {avatar ? (
            <img 
              src={avatar} 
              alt={driverName} 
              className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-brand-red)] shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-saggin-elevated)] border-2 border-[var(--color-saggin-border)] flex items-center justify-center font-bold text-3xl font-space text-[var(--color-saggin-text-primary)]">
              {driverName.charAt(0)}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[var(--color-success)] border-2 border-white shadow-2xs" />
        </div>

        <h1 className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
          {driverName}
        </h1>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-red)] bg-red-50 border border-red-200 px-3 py-1 rounded-full mt-1.5">
          Autista Saggin Trasporti
        </span>
      </div>

      {/* STATISTICHE RAPIDE */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-saggin-surface)] p-4 rounded-2xl border border-[var(--color-saggin-border)] shadow-xs">
          <div className="flex items-center gap-2 text-[var(--color-saggin-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckCircle size={15} className="text-[var(--color-success)]" />
            <span>Viaggi Fatti</span>
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {stats.totalTrips}
          </div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-4 rounded-2xl border border-[var(--color-saggin-border)] shadow-xs">
          <div className="flex items-center gap-2 text-[var(--color-saggin-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock size={15} className="text-[var(--color-brand-red)]" />
            <span>Ore Totali</span>
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {stats.totalHours}h
          </div>
        </div>
      </div>

      {/* DETTAGLI ASSEGNAZIONE */}
      <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)] space-y-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
          Informazioni Mezzo & Account
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-[var(--color-saggin-border)]/60">
          <div className="flex items-center gap-2.5 text-sm text-[var(--color-saggin-text-secondary)]">
            <Truck size={18} className="text-slate-400" />
            <span>Mezzo principale:</span>
          </div>
          <span className="font-bold text-sm text-[var(--color-saggin-text-primary)]">
            {driverData?.defaultVehicle?.name || 'Senza mezzo fisso'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[var(--color-saggin-border)]/60">
          <div className="flex items-center gap-2.5 text-sm text-[var(--color-saggin-text-secondary)]">
            <Shield size={18} className="text-slate-400" />
            <span>Autenticazione:</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[var(--color-saggin-text-primary)] bg-[var(--color-saggin-elevated)] px-2 py-0.5 rounded border border-[var(--color-saggin-border)]">
            PIN Personale attivo
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5 text-sm text-[var(--color-saggin-text-secondary)]">
            <Phone size={18} className="text-slate-400" />
            <span>Contatto Ufficio:</span>
          </div>
          <a href="tel:0444000000" className="text-sm font-bold text-[var(--color-brand-red)] hover:underline">
            Ufficio Saggin
          </a>
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="pt-2">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-[var(--color-brand-red)] border border-red-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs text-sm"
        >
          <LogOut size={18} />
          <span>Disconnetti Account</span>
        </button>
      </div>
    </div>
  )
}
