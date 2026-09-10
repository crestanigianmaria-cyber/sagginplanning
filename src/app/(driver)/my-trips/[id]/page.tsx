'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Package, AlertTriangle, Truck, Clock, FileText, CheckCircle, Navigation, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = React.use(params)
  
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // End Trip Modal State
  const [showEndModal, setShowEndModal] = useState(false)
  const [actualCraneHours, setActualCraneHours] = useState('')
  const [driverNotes, setDriverNotes] = useState('')

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success === false || !data.data) {
          setTrip(null)
        } else {
          setTrip(data.data)
        }
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [id])

  const handleStartTrip = async () => {
    setActionLoading(true)
    try {
      let lat = 45.4642, lng = 9.1900; 
      
      await fetch(`/api/trips/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      })
      
      router.refresh()
      window.location.reload()
    } catch (e) {
      alert("Errore durante l'aggiornamento")
      setActionLoading(false)
    }
  }

  const handleEndTrip = async () => {
    setActionLoading(true)
    try {
      let lat = 45.4642, lng = 9.1900; 
      
      await fetch(`/api/trips/${id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, actualCraneHours, driverNotes })
      })
      
      setShowEndModal(false)
      router.refresh()
      window.location.reload()
    } catch (e) {
      alert("Errore durante l'aggiornamento")
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[var(--color-saggin-bg)]">
      <div className="animate-spin h-10 w-10 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full"></div>
    </div>
  )

  if (!trip) return <div className="p-6 text-[var(--color-saggin-text-primary)] bg-[var(--color-saggin-bg)] min-h-screen">Viaggio non trovato</div>

  return (
    <div className="min-h-screen bg-[var(--color-saggin-bg)] flex flex-col pb-24 text-[var(--color-saggin-text-primary)] relative">
      <div className="bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] p-5 md:p-6 sticky top-0 z-10 flex items-center gap-5 md:p-6">
        <Link href="/my-trips" className="p-2 -ml-2 rounded-full hover:bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-secondary)]">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-medium">Dettaglio Viaggio</h1>
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <div className="bg-[var(--color-saggin-surface)] rounded-xl p-5  border border-[var(--color-saggin-border)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm text-[var(--color-saggin-text-secondary)] mb-1">Orario previsto</div>
              <div className="text-4xl font-extrabold text-[var(--color-saggin-text-primary)]">{trip.scheduledTime}</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-semibold border",
              trip.status === 'DA_FARE' ? 'bg-[var(--color-saggin-bg)] border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)]' :
              trip.status === 'IN_CORSO' ? 'bg-[var(--color-brand-red)]/20 border-[var(--color-brand-red)]/40 text-[var(--color-brand-red)]' :
              trip.status === 'COMPLETATO' ? 'bg-emerald-900/30 border-emerald-500/30 text-[var(--color-success)]' :
              'bg-red-900/30 border-red-500/30 text-red-500'
            )}>
              {trip?.status?.replace('_', ' ') || 'SCONOSCIUTO'}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* DESTINAZIONE & MAPS CTA */}
            <div className="p-5 md:p-6 bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] rounded-xl space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-[var(--color-brand-red)] shrink-0 mt-1" size={24} />
                <div>
                  <div className="text-sm text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-1">Destinazione</div>
                  <div className="text-xl font-semibold leading-tight">{trip.address}</div>
                </div>
              </div>
              
              {/* Box Tempi e Distanza */}
              {trip.estimatedDistanceKm && (
                <div className="flex gap-2 bg-[var(--color-saggin-surface)] p-3 rounded-xl border border-[var(--color-saggin-border)]">
                  <div className="flex-1 flex flex-col items-center justify-center border-r border-[var(--color-saggin-border)]">
                    <span className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Distanza</span>
                    <span className="text-lg font-semibold text-[var(--color-saggin-text-primary)]">{trip.estimatedDistanceKm} km</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Tempo stimato</span>
                    <span className="text-lg font-semibold text-[var(--color-brand-red)]">{trip.estimatedDurationMins} min</span>
                  </div>
                </div>
              )}

              {/* Tasto Navigatore */}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.address)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-4 bg-[var(--color-saggin-bg)]lue-600 hover:bg-[var(--color-saggin-bg)]lue-700 active:bg-[var(--color-saggin-bg)]lue-800 text-[var(--color-saggin-text-primary)] font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors "
              >
                <Navigation size={24} /> APRI NAVIGATORE
              </a>
            </div>

            {/* REFERENTE & TELEFONO CTA */}
            {(trip.contactName || trip.contactPhone) && (
              <div className="p-5 md:p-6 bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] rounded-xl space-y-4">
                <div>
                  <div className="text-sm text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-1">Referente Cantiere</div>
                  <div className="text-lg font-medium">{trip.contactName || 'Non specificato'}</div>
                  {trip.contactPhone && <div className="text-[var(--color-saggin-text-secondary)] font-mono text-lg">{trip.contactPhone}</div>}
                </div>

                {trip.contactPhone && (
                  <a 
                    href={`tel:${trip.contactPhone.replace(/\s+/g, '')}`}
                    className="w-full py-4 bg-[var(--color-success)] hover:bg-[#329267] active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors "
                  >
                    <Phone size={24} /> CHIAMA ORA
                  </a>
                )}
              </div>
            )}

            {/* MATERIALE */}
            <div className="flex gap-5 md:p-6 p-2">
              <Package className="text-[var(--color-saggin-text-secondary)] shrink-0 mt-1" size={24} />
              <div>
                <div className="text-sm text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-1">Materiale</div>
                <div className="text-lg font-medium leading-tight">{trip.cargoDescription}</div>
                {(trip.cargoWeight || trip.cargoLength) && (
                  <div className="mt-2 text-sm text-[var(--color-saggin-text-secondary)] flex flex-wrap gap-2">
                    {trip.cargoWeight && <span className="bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] px-2 py-1 rounded font-mono">{trip.cargoWeight} kg</span>}
                    {trip.cargoLength && <span className="bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] px-2 py-1 rounded font-mono">{trip.cargoLength}x{trip.cargoWidth}x{trip.cargoHeight} m</span>}
                  </div>
                )}
              </div>
            </div>

            {/* MEZZO */}
            <div className="flex gap-5 md:p-6 p-2">
              <Truck className="text-[var(--color-saggin-text-secondary)] shrink-0 mt-1" size={24} />
              <div>
                <div className="text-sm text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-1">Mezzo Assegnato</div>
                <div className="text-lg font-medium leading-tight">{trip.vehicle?.name}</div>
              </div>
            </div>

            {/* GRU */}
            {trip.needsCrane && (
              <div className="flex gap-5 md:p-6 p-5 md:p-6 bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/30 rounded-xl">
                <AlertTriangle className="text-[var(--color-brand-red)] shrink-0" size={28} />
                <div>
                  <div className="text-[var(--color-brand-red)] font-semibold text-lg leading-tight">Uso Gru Richiesto</div>
                  {trip.craneWorkRadius && (
                    <div className="text-sm text-[var(--color-brand-red)]/80 mt-1 font-medium">Sbraccio operativo: {trip.craneWorkRadius} metri</div>
                  )}
                </div>
              </div>
            )}
            
            {/* NOTE */}
            {trip.notes && (
              <div className="mt-2 p-5 md:p-6 bg-[var(--color-saggin-bg)] rounded-xl border border-[var(--color-saggin-border)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-500"></div>
                <div className="text-xs text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-2 pl-2">Note ufficio:</div>
                <div className="text-[var(--color-saggin-text-primary)] pl-2 text-lg italic">{trip.notes}</div>
              </div>
            )}
            
            {/* RIEPILOGO LAVORO (A FINE LAVORO) */}
            {trip.status === 'COMPLETATO' && (
              <div className="mt-6 p-5 bg-[var(--color-saggin-bg)] border border-emerald-900/50 rounded-xl relative overflow-hidden ">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-2 mb-4 pl-2">
                  <CheckCircle className="text-[var(--color-success)]" size={20} />
                  <h3 className="font-semibold text-[var(--color-success)] uppercase tracking-wider text-sm">Riepilogo Lavoro</h3>
                </div>
                
                <div className="pl-2 grid grid-cols-2 gap-5 md:p-6 mb-4">
                  <div>
                    <div className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Inizio</div>
                    <div className="text-[var(--color-saggin-text-primary)] font-semibold">{trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Fine</div>
                    <div className="text-[var(--color-saggin-text-primary)] font-semibold">{trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  
                  {trip.workedMinutes != null && (
                    <div className="col-span-2 p-3 bg-[var(--color-saggin-surface)] rounded-xl border border-[var(--color-saggin-border)] flex justify-between items-center">
                      <span className="text-sm text-[var(--color-saggin-text-secondary)] font-medium">Tempo totale lavorato</span>
                      <span className="text-xl font-bold text-[var(--color-saggin-text-primary)]">
                        {Math.floor(trip.workedMinutes / 60)}h {trip.workedMinutes % 60}m
                      </span>
                    </div>
                  )}
                  
                  {trip.actualCraneHours != null && (
                    <div className="col-span-2 p-3 bg-[var(--color-saggin-surface)] rounded-xl border border-[var(--color-saggin-border)] flex justify-between items-center">
                      <span className="text-sm text-[var(--color-saggin-text-secondary)] font-medium">Ore utilizzo Gru</span>
                      <span className="text-xl font-bold text-[var(--color-brand-red)]">{trip.actualCraneHours}h</span>
                    </div>
                  )}
                </div>

                {trip.driverNotes && (
                  <div className="pl-2 mt-4 pt-4 border-t border-[var(--color-saggin-border)]">
                    <div className="text-xs text-[var(--color-saggin-text-secondary)] font-semibold uppercase tracking-wider mb-2">Le tue note / Problemi in cantiere:</div>
                    <div className="text-emerald-100 text-lg italic bg-emerald-900/10 p-3 rounded-xl border border-emerald-900/30">{trip.driverNotes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-[65px] w-full p-5 md:p-6 bg-[var(--color-saggin-surface)] border-t border-[var(--color-saggin-border)]  z-20">
        {trip.status === 'DA_FARE' && (
          <button
            disabled={actionLoading}
            onClick={handleStartTrip}
            className="w-full bg-[var(--color-brand-red)] hover:bg-[#b91c1c] active:scale-[0.98] text-[var(--color-saggin-text-primary)] text-xl font-semibold py-5 rounded-2xl  transition-all flex justify-center items-center gap-3"
          >
            {actionLoading ? <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full" /> : 'INIZIA LAVORO'}
          </button>
        )}
        {trip.status === 'IN_CORSO' && (
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full bg-[var(--color-success)] hover:bg-[#329267] active:scale-[0.98] text-white text-xl font-semibold py-5 rounded-2xl  transition-all flex justify-center items-center gap-3"
          >
            TERMINA LAVORO
          </button>
        )}
        {trip.status === 'COMPLETATO' && (
          <div className="w-full bg-emerald-900/20 text-[var(--color-success)] border border-emerald-900/50 text-xl font-semibold py-4 rounded-2xl text-center flex justify-center items-center gap-2">
            <CheckCircle size={24} /> VIAGGIO COMPLETATO
          </div>
        )}
      </div>

      {/* END TRIP MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-5 md:p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-[var(--color-saggin-surface)] w-full max-w-md rounded-[32px] p-8 border border-[var(--color-saggin-border)]  animate-in slide-in-from-bottom-8">
            <h2 className="text-3xl font-semibold text-[var(--color-saggin-text-primary)] mb-2">Concludi Viaggio</h2>
            <p className="text-[var(--color-saggin-text-secondary)] mb-8 text-lg">Inserisci i dati conclusivi della consegna.</p>
            
            {trip.needsCrane && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-3">Ore di utilizzo GRU</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-saggin-text-secondary)] h-7 w-7" />
                  <input
                    type="number"
                    step="0.5"
                    value={actualCraneHours}
                    onChange={(e) => setActualCraneHours(e.target.value)}
                    placeholder="Es. 2.5"
                    className="w-full bg-[var(--color-saggin-bg)] border-2 border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-2xl font-semibold rounded-2xl py-5 pl-16 pr-6 focus:ring-4 focus:ring-[#dc2626]/20 focus:border-[var(--color-brand-red)] outline-none transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-10">
              <label className="block text-sm font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-3">Note / Problemi in cantiere</label>
              <textarea
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="Scrivi qui eventuali note..."
                rows={4}
                className="w-full bg-[var(--color-saggin-bg)] border-2 border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-lg rounded-2xl py-4 px-5 focus:ring-4 focus:ring-[#dc2626]/20 focus:border-[var(--color-brand-red)] outline-none resize-none transition-all"
              />
            </div>
            
            <div className="flex gap-5 md:p-6">
              <button 
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-5 text-[var(--color-saggin-text-secondary)] font-semibold text-lg bg-[var(--color-saggin-bg)] rounded-2xl hover:bg-gray-200 transition-colors"
              >
                ANNULLA
              </button>
              <button 
                onClick={handleEndTrip}
                disabled={actionLoading}
                className="flex-[2] py-5 text-[var(--color-saggin-text-primary)] font-semibold text-lg text-white bg-[var(--color-success)] rounded-2xl hover:bg-[#329267] transition-colors flex justify-center items-center gap-2 "
              >
                {actionLoading ? <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full" /> : <><CheckCircle size={28} /> CONFERMA</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
