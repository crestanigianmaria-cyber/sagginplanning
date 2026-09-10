'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MapPin, Calendar, CheckCircle2, Clock, Play, AlertTriangle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trip = {
  id: string
  status: 'DA_FARE' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
  scheduledTime: string
  cargoDescription: string
  address: string
  vehicleName?: string
  needsCrane: boolean
  clientName?: string
  contactName?: string
}

export default function MyTripsPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`/api/trips?date=${today}&driverId=${(session.user as any).id || ''}`)
        .then(res => res.json())
        .then(data => {
          setTrips(data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
          setLoading(false)
        })
        .catch(e => {
          console.error(e)
          setLoading(false)
        })
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-[var(--color-saggin-bg)]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full" />
      </div>
    )
  }

  const completed = trips.filter(t => t.status === 'COMPLETATO').length
  const total = trips.length

  return (
    <div className="p-4 space-y-4 font-sans max-w-lg mx-auto">
      {/* HEADER COUNTER */}
      <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-4 flex justify-between items-center border border-[var(--color-saggin-border)] shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">Programma Consegne</span>
          <div className="font-bold text-[var(--color-saggin-text-primary)] text-lg font-space">
            {total === 0 ? 'Nessun viaggio oggi' : `${total} ${total === 1 ? 'viaggio' : 'viaggi'} per oggi`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-red-50 text-[var(--color-brand-red)] px-3 py-1.5 rounded-xl font-bold font-space text-sm border border-red-200 shadow-2xs">
            {completed} / {total} fatti
          </span>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--color-saggin-text-secondary)] space-y-4 bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--color-saggin-elevated)] flex items-center justify-center text-slate-400">
            <Calendar size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-saggin-text-primary)]">Nessun viaggio programmato</h3>
            <p className="text-xs text-[var(--color-saggin-text-secondary)] mt-1">Non ci sono consegne assegnate per la giornata odierna.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => {
            const isCompleted = trip.status === 'COMPLETATO'
            const isInProgress = trip.status === 'IN_CORSO'

            return (
              <Link key={trip.id} href={`/my-trips/${trip.id}`} className="block group">
                <div className={cn(
                  "bg-[var(--color-saggin-surface)] rounded-2xl border transition-all p-4 relative overflow-hidden shadow-xs hover:shadow-sm active:scale-[0.99]",
                  isInProgress ? "border-[var(--color-warning)] ring-2 ring-[var(--color-warning)]/20" :
                  isCompleted ? "border-emerald-300 opacity-90" :
                  "border-[var(--color-saggin-border)] hover:border-slate-400"
                )}>
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-1.5",
                    isInProgress ? "bg-[var(--color-warning)]" :
                    isCompleted ? "bg-[var(--color-success)]" :
                    "bg-slate-400"
                  )} />

                  {/* Top Bar: Orario e Badge Stato */}
                  <div className="flex justify-between items-center pl-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[var(--color-brand-red)]" />
                      <span className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)] tracking-tight">
                        {trip.scheduledTime}
                      </span>
                    </div>

                    <div className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs",
                      isCompleted ? "bg-emerald-50 border-emerald-200 text-[var(--color-success)]" :
                      isInProgress ? "bg-amber-50 border-amber-200 text-[var(--color-warning)] font-bold animate-pulse" :
                      "bg-slate-100 border-slate-200 text-slate-700"
                    )}>
                      {isCompleted && <CheckCircle2 size={13} />}
                      {isInProgress && <Play size={13} className="fill-[var(--color-warning)]" />}
                      <span>
                        {trip.status === 'DA_FARE' ? 'Da fare' :
                         trip.status === 'IN_CORSO' ? 'In corso ora' :
                         trip.status === 'COMPLETATO' ? 'Completato' : 'Annullato'}
                      </span>
                    </div>
                  </div>

                  {/* Cargo Description */}
                  <div className="pl-2 mb-3">
                    <h3 className="text-base font-bold text-[var(--color-saggin-text-primary)] line-clamp-1 leading-snug">
                      {trip.cargoDescription}
                    </h3>
                  </div>
                  
                  {/* Destinatario e Indirizzo */}
                  <div className="pl-2 mb-3 bg-[var(--color-saggin-elevated)] p-3 rounded-xl border border-[var(--color-saggin-border)]">
                    <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] mb-0.5 truncate">
                      {trip.clientName || trip.contactName || 'Destinazione cantiere'}
                    </div>
                    <div className="flex items-start gap-1.5 text-[var(--color-saggin-text-secondary)]">
                      <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[var(--color-brand-red)]" />
                      <span className="text-xs line-clamp-2 leading-relaxed font-medium">{trip.address}</span>
                    </div>
                  </div>
                  
                  {/* Bottom details: Mezzo e Gru */}
                  <div className="flex justify-between items-center pl-2 pt-2.5 border-t border-[var(--color-saggin-border)]/80 text-xs">
                    <div className="font-semibold text-[var(--color-saggin-text-secondary)] truncate mr-2">
                      {trip.vehicleName || 'Mezzo da assegnare'}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {trip.needsCrane && (
                        <span className="bg-red-50 text-[var(--color-brand-red)] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <AlertTriangle size={11} />
                          GRU
                        </span>
                      )}
                      <ArrowRight size={15} className="text-slate-400 group-hover:text-[var(--color-saggin-text-primary)] transition-colors" />
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
