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
    <div className="flex justify-center items-center h-screen bg-zinc-950">
      <div className="animate-spin h-10 w-10 border-4 border-[#dc2626] border-t-transparent rounded-full"></div>
    </div>
  )

  if (!trip) return <div className="p-6 text-white bg-zinc-950 min-h-screen">Viaggio non trovato</div>

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-24 text-white relative">
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/my-trips" className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-300">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-medium">Dettaglio Viaggio</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm text-zinc-500 mb-1">Orario previsto</div>
              <div className="text-4xl font-extrabold text-white">{trip.scheduledTime}</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-bold border",
              trip.status === 'DA_FARE' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' :
              trip.status === 'IN_CORSO' ? 'bg-[#dc2626]/20 border-[#dc2626]/40 text-[#dc2626]' :
              trip.status === 'COMPLETATO' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-500' :
              'bg-red-900/30 border-red-500/30 text-red-500'
            )}>
              {trip?.status?.replace('_', ' ') || 'SCONOSCIUTO'}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* DESTINAZIONE & MAPS CTA */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-[#dc2626] shrink-0 mt-1" size={24} />
                <div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Destinazione</div>
                  <div className="text-xl font-bold leading-tight">{trip.address}</div>
                </div>
              </div>
              
              {/* Box Tempi e Distanza */}
              {trip.estimatedDistanceKm && (
                <div className="flex gap-2 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                  <div className="flex-1 flex flex-col items-center justify-center border-r border-zinc-800">
                    <span className="text-xs text-zinc-500 font-medium">Distanza</span>
                    <span className="text-lg font-bold text-white">{trip.estimatedDistanceKm} km</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 font-medium">Tempo stimato</span>
                    <span className="text-lg font-bold text-[#dc2626]">{trip.estimatedDurationMins} min</span>
                  </div>
                </div>
              )}

              {/* Tasto Navigatore */}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.address)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <Navigation size={24} /> APRI NAVIGATORE
              </a>
            </div>

            {/* REFERENTE & TELEFONO CTA */}
            {(trip.contactName || trip.contactPhone) && (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                <div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Referente Cantiere</div>
                  <div className="text-lg font-medium">{trip.contactName || 'Non specificato'}</div>
                  {trip.contactPhone && <div className="text-zinc-400 font-mono text-lg">{trip.contactPhone}</div>}
                </div>

                {trip.contactPhone && (
                  <a 
                    href={`tel:${trip.contactPhone.replace(/\s+/g, '')}`}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
                  >
                    <Phone size={24} /> CHIAMA ORA
                  </a>
                )}
              </div>
            )}

            {/* MATERIALE */}
            <div className="flex gap-4 p-2">
              <Package className="text-zinc-400 shrink-0 mt-1" size={24} />
              <div>
                <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Materiale</div>
                <div className="text-lg font-medium leading-tight">{trip.cargoDescription}</div>
                {(trip.cargoWeight || trip.cargoLength) && (
                  <div className="mt-2 text-sm text-zinc-400 flex flex-wrap gap-2">
                    {trip.cargoWeight && <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded font-mono">{trip.cargoWeight} kg</span>}
                    {trip.cargoLength && <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded font-mono">{trip.cargoLength}x{trip.cargoWidth}x{trip.cargoHeight} m</span>}
                  </div>
                )}
              </div>
            </div>

            {/* MEZZO */}
            <div className="flex gap-4 p-2">
              <Truck className="text-zinc-400 shrink-0 mt-1" size={24} />
              <div>
                <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Mezzo Assegnato</div>
                <div className="text-lg font-medium leading-tight">{trip.vehicle?.name}</div>
              </div>
            </div>

            {/* GRU */}
            {trip.needsCrane && (
              <div className="flex gap-4 p-4 bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-xl">
                <AlertTriangle className="text-[#dc2626] shrink-0" size={28} />
                <div>
                  <div className="text-[#dc2626] font-bold text-lg leading-tight">Uso Gru Richiesto</div>
                  {trip.craneWorkRadius && (
                    <div className="text-sm text-[#dc2626]/80 mt-1 font-medium">Sbraccio operativo: {trip.craneWorkRadius} metri</div>
                  )}
                </div>
              </div>
            )}
            
            {/* NOTE */}
            {trip.notes && (
              <div className="mt-2 p-4 bg-zinc-800 rounded-xl border border-zinc-700 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-500"></div>
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2 pl-2">Note ufficio:</div>
                <div className="text-zinc-200 pl-2 text-lg italic">{trip.notes}</div>
              </div>
            )}
            
            {/* RIEPILOGO LAVORO (A FINE LAVORO) */}
            {trip.status === 'COMPLETATO' && (
              <div className="mt-6 p-5 bg-zinc-950 border border-emerald-900/50 rounded-xl relative overflow-hidden shadow-lg">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-2 mb-4 pl-2">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <h3 className="font-bold text-emerald-500 uppercase tracking-wider text-sm">Riepilogo Lavoro</h3>
                </div>
                
                <div className="pl-2 grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Inizio</div>
                    <div className="text-white font-bold">{trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Fine</div>
                    <div className="text-white font-bold">{trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  
                  {trip.workedMinutes != null && (
                    <div className="col-span-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-medium">Tempo totale lavorato</span>
                      <span className="text-xl font-black text-white">
                        {Math.floor(trip.workedMinutes / 60)}h {trip.workedMinutes % 60}m
                      </span>
                    </div>
                  )}
                  
                  {trip.actualCraneHours != null && (
                    <div className="col-span-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-medium">Ore utilizzo Gru</span>
                      <span className="text-xl font-black text-[#dc2626]">{trip.actualCraneHours}h</span>
                    </div>
                  )}
                </div>

                {trip.driverNotes && (
                  <div className="pl-2 mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Le tue note / Problemi in cantiere:</div>
                    <div className="text-emerald-100 text-lg italic bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/30">{trip.driverNotes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-[65px] w-full p-4 bg-zinc-950 border-t border-zinc-800 shadow-[0_-15px_40px_rgba(0,0,0,0.9)] z-20">
        {trip.status === 'DA_FARE' && (
          <button
            disabled={actionLoading}
            onClick={handleStartTrip}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.98] text-white text-xl font-bold py-5 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex justify-center items-center gap-3"
          >
            {actionLoading ? <div className="animate-spin h-6 w-6 border-4 border-white/30 border-t-white rounded-full" /> : 'INIZIA LAVORO'}
          </button>
        )}
        {trip.status === 'IN_CORSO' && (
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xl font-bold py-5 rounded-2xl shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all flex justify-center items-center gap-3"
          >
            TERMINA LAVORO
          </button>
        )}
        {trip.status === 'COMPLETATO' && (
          <div className="w-full bg-emerald-900/20 text-emerald-500 border border-emerald-900/50 text-xl font-bold py-4 rounded-2xl text-center flex justify-center items-center gap-2">
            <CheckCircle size={24} /> VIAGGIO COMPLETATO
          </div>
        )}
      </div>

      {/* END TRIP MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 w-full max-w-md rounded-[32px] p-8 border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-3xl font-bold text-white mb-2">Concludi Viaggio</h2>
            <p className="text-zinc-400 mb-8 text-lg">Inserisci i dati conclusivi della consegna.</p>
            
            {trip.needsCrane && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Ore di utilizzo GRU</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 h-7 w-7" />
                  <input
                    type="number"
                    step="0.5"
                    value={actualCraneHours}
                    onChange={(e) => setActualCraneHours(e.target.value)}
                    placeholder="Es. 2.5"
                    className="w-full bg-zinc-950 border-2 border-zinc-800 text-white text-2xl font-bold rounded-2xl py-5 pl-16 pr-6 focus:ring-4 focus:ring-[#dc2626]/20 focus:border-[#dc2626] outline-none transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-10">
              <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Note / Problemi in cantiere</label>
              <textarea
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="Scrivi qui eventuali note..."
                rows={4}
                className="w-full bg-zinc-950 border-2 border-zinc-800 text-white text-lg rounded-2xl py-4 px-5 focus:ring-4 focus:ring-[#dc2626]/20 focus:border-[#dc2626] outline-none resize-none transition-all"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-5 text-zinc-400 font-bold text-lg bg-zinc-800 rounded-2xl hover:bg-zinc-700 transition-colors"
              >
                ANNULLA
              </button>
              <button 
                onClick={handleEndTrip}
                disabled={actionLoading}
                className="flex-[2] py-5 text-white font-bold text-lg bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(5,150,105,0.3)]"
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
