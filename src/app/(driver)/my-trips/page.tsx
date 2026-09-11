'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  MapPin, Calendar, CheckCircle2, Clock, Play, AlertTriangle, 
  ArrowRight, User, Sparkles, Filter, Truck
} from 'lucide-react'
import { cn, getDriverAvatar } from '@/lib/utils'

type Trip = {
  id: string
  date: string
  status: 'DA_FARE' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
  scheduledTime: string
  cargoDescription: string
  address: string
  vehicleName?: string
  vehicle?: { name: string }
  needsCrane: boolean
  clientName?: string
  contactName?: string
  createdByName?: string
}

export default function MyTripsPage() {
  const { data: session } = useSession()
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [filterMode, setFilterMode] = useState<'all' | 'today'>('all')
  const [loading, setLoading] = useState(true)

  const driverId = (session?.user as any)?.id
  const driverName = session?.user?.name || 'Autista'
  const driverAvatar = getDriverAvatar(driverName, (session?.user as any)?.profilePicture)

  useEffect(() => {
    if (driverId) {
      // Carichiamo TUTTI i viaggi assegnati a questo autista (senza restrizione rigida a un solo giorno UTC)
      fetch(`/api/trips?driverId=${driverId}`)
        .then(res => res.json())
        .then(data => {
          const list = data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
          setAllTrips(list)
          setLoading(false)
        })
        .catch(e => {
          console.error(e)
          setLoading(false)
        })
    }
  }, [driverId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-[var(--color-saggin-bg)]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full" />
      </div>
    )
  }

  // Filtraggio dinamico
  const todayStr = new Date().toISOString().split('T')[0]
  
  const displayedTrips = allTrips.filter(t => {
    if (filterMode === 'today') {
      return t.date?.startsWith(todayStr)
    }
    // Per 'all', mostriamo prima tutti i viaggi DA_FARE o IN_CORSO + completati
    return t.status !== 'ANNULLATO'
  }).sort((a, b) => {
    // Il viaggio IN_CORSO deve sempre stare in cima alla lista!
    if (a.status === 'IN_CORSO' && b.status !== 'IN_CORSO') return -1;
    if (b.status === 'IN_CORSO' && a.status !== 'IN_CORSO') return 1;
    const dateComp = (a.date || '').localeCompare(b.date || '')
    if (dateComp !== 0) return dateComp
    return (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
  })

  const completedCount = allTrips.filter(t => t.status === 'COMPLETATO').length
  const pendingCount = allTrips.filter(t => t.status === 'DA_FARE' || t.status === 'IN_CORSO').length

  return (
    <div className="p-4 space-y-4 font-sans max-w-lg mx-auto">
      
      {/* SCHEDA IDENTITÀ AUTISTA CON FOTO PROFILO */}
      <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-4 border border-[var(--color-saggin-border)] shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="shrink-0 relative" title="Visualizza il tuo profilo">
            {driverAvatar ? (
              <img 
                src={driverAvatar} 
                alt={driverName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-brand-red)] shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center font-bold text-base text-[var(--color-saggin-text-primary)]">
                {driverName.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--color-success)] border-2 border-white" />
          </Link>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
              Autista Connesso
            </div>
            <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
              {driverName}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="bg-red-50 text-[var(--color-brand-red)] px-2.5 py-1 rounded-xl font-bold font-space text-xs border border-red-200">
            {pendingCount} da fare
          </span>
          <span className="text-[10px] text-[var(--color-saggin-text-secondary)] mt-1 font-medium">
            {completedCount} completati
          </span>
        </div>
      </div>

      {/* TABS FILTRO: TUTTI I VIAGGI VS SOLO OGGI */}
      <div className="flex rounded-xl bg-[var(--color-saggin-elevated)] p-1 border border-[var(--color-saggin-border)]">
        <button
          onClick={() => setFilterMode('all')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
            filterMode === 'all' 
              ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs border border-slate-200" 
              : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
          )}
        >
          <span>Tutti in Programma</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 font-mono font-bold">
            {allTrips.filter(t => t.status !== 'ANNULLATO').length}
          </span>
        </button>

        <button
          onClick={() => setFilterMode('today')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
            filterMode === 'today' 
              ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs border border-slate-200" 
              : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
          )}
        >
          <span>Solo di Oggi</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 font-mono font-bold">
            {allTrips.filter(t => t.date?.startsWith(todayStr)).length}
          </span>
        </button>
      </div>

      {/* LISTA VIAGGI */}
      {displayedTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--color-saggin-text-secondary)] space-y-4 bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] p-6 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[var(--color-saggin-elevated)] flex items-center justify-center text-slate-400">
            <Calendar size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-saggin-text-primary)]">
              {filterMode === 'today' ? 'Nessun viaggio oggi' : 'Nessun viaggio assegnato'}
            </h3>
            <p className="text-xs text-[var(--color-saggin-text-secondary)] mt-1 max-w-xs">
              {filterMode === 'today' 
                ? 'Prova a cliccare su "Tutti in Programma" per verificare le consegne previste per altri giorni.'
                : 'Quando l\'ufficio pianifica una consegna per te, comparirà immediatamente in questo elenco.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTrips.map(trip => {
            const isCompleted = trip.status === 'COMPLETATO'
            const isInProgress = trip.status === 'IN_CORSO'
            const tripDate = trip.date ? new Date(trip.date) : null
            const isToday = tripDate ? tripDate.toISOString().split('T')[0] === todayStr : false

            return (
              <Link key={trip.id} href={`/my-trips/${trip.id}`} className="block group">
                <div className={cn(
                  "bg-[var(--color-saggin-surface)] rounded-2xl border transition-all p-4 relative overflow-hidden shadow-2xs hover:shadow-xs active:scale-[0.99]",
                  isInProgress ? "border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/15" :
                  isCompleted ? "border-emerald-300 opacity-90" :
                  "border-[var(--color-saggin-border)] hover:border-slate-400"
                )}>
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-1.5",
                    isInProgress ? "bg-amber-500" :
                    isCompleted ? "bg-[var(--color-success)]" :
                    "bg-slate-400"
                  )} />

                  {/* Banner "In Corso" se attivo */}
                  {isInProgress && (
                    <div className="pl-2 mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/80 animate-pulse">
                      <Play size={13} className="fill-amber-600" />
                      <span>VIAGGIO IN CORSO ORA — Tocca per dettagli / chiusura</span>
                    </div>
                  )}

                  {/* Top Bar: Data/Orario e Badge Stato */}
                  <div className="flex justify-between items-center pl-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[var(--color-brand-red)]" />
                      <span className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)] tracking-tight">
                        {trip.scheduledTime}
                      </span>
                      
                      {/* Date Pill se diverso da oggi */}
                      {!isToday && tripDate && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] font-mono">
                          {tripDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    <div className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs",
                      isCompleted ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                      isInProgress ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" :
                      "bg-slate-100 border-slate-200 text-slate-700"
                    )}>
                      {isCompleted && <CheckCircle2 size={13} />}
                      {isInProgress && <Play size={13} className="fill-amber-600" />}
                      <span>
                        {trip.status === 'DA_FARE' ? 'Da fare' :
                         trip.status === 'IN_CORSO' ? 'In corso' :
                         trip.status === 'COMPLETATO' ? 'Completato' : 'Annullato'}
                      </span>
                    </div>
                  </div>

                  {/* Destinatario / Cliente in evidenza */}
                  <div className="pl-2 mb-1.5">
                    <div className="text-base font-bold text-[var(--color-saggin-text-primary)] line-clamp-1 leading-snug">
                      {trip.clientName || trip.contactName || trip.cargoDescription}
                    </div>
                  </div>

                  {/* Cargo Description */}
                  <div className="pl-2 mb-3 text-xs font-medium text-slate-600 line-clamp-1">
                    📦 {trip.cargoDescription}
                  </div>
                  
                  {/* Destinatario e Indirizzo */}
                  <div className="pl-2 mb-3 bg-[var(--color-saggin-elevated)] p-3 rounded-xl border border-[var(--color-saggin-border)]">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[var(--color-brand-red)]" />
                      <span className="text-xs line-clamp-2 leading-relaxed font-semibold">{trip.address}</span>
                    </div>
                  </div>
                  
                  {/* Bottom details: Mezzo, Gru e CHI HA CREATO IL VIAGGIO */}
                  <div className="pl-2 pt-2.5 border-t border-[var(--color-saggin-border)]/80 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-semibold text-[var(--color-saggin-text-secondary)] truncate mr-2 flex items-center gap-1.5">
                        <Truck size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{trip.vehicle?.name || trip.vehicleName || 'Mezzo da assegnare'}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {trip.needsCrane && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <AlertTriangle size={11} className="text-amber-700" />
                            GRU
                          </span>
                        )}
                        <ArrowRight size={15} className="text-slate-400 group-hover:text-[var(--color-saggin-text-primary)] transition-colors" />
                      </div>
                    </div>

                    {/* VEDERE CHI HA CREATO IL VIAGGIO */}
                    <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={13} className="text-[var(--color-brand-red)]" />
                        <span>Creato da:</span>
                        <strong className="text-[var(--color-saggin-text-primary)]">{trip.createdByName || 'Ufficio Saggin'}</strong>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Ufficio</span>
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
