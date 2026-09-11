'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Package, AlertTriangle, Truck, Clock, 
  CheckCircle, Navigation, Phone, Play, Check, ShieldAlert,
  Calendar, Building2, Hash, FileText
} from 'lucide-react'
import { cn, getDriverAvatar } from '@/lib/utils'

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = React.use(params)
  
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Live Timer for IN_CORSO
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  // End Trip Modal State
  const [showEndModal, setShowEndModal] = useState(false)
  const [actualCraneHours, setActualCraneHours] = useState('')
  const [driverNotes, setDriverNotes] = useState('')

  useEffect(() => {
    fetchTrip()
  }, [id])

  const fetchTrip = () => {
    fetch(`/api/trips/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTrip(data.data)
        } else {
          setTrip(null)
        }
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }

  // Timer interval when status is IN_CORSO
  useEffect(() => {
    if (!trip || trip.status !== 'IN_CORSO' || !trip.actualStartTime) return

    const calculateElapsed = () => {
      const start = new Date(trip.actualStartTime).getTime()
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)))
    }

    calculateElapsed()
    const timer = setInterval(calculateElapsed, 1000)
    return () => clearInterval(timer)
  }, [trip?.status, trip?.actualStartTime])

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getCoordinates = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 45.71902, lng: 11.67734 }),
          { enableHighAccuracy: true, timeout: 8000 }
        )
      } else {
        resolve({ lat: 45.71902, lng: 11.67734 })
      }
    })
  }

  const handleStartTrip = async () => {
    setActionLoading(true)
    try {
      const coords = await getCoordinates()
      
      const res = await fetch(`/api/trips/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords)
      })

      if (res.ok) {
        fetchTrip()
      } else {
        alert("Errore durante l'avvio del viaggio")
      }
    } catch (e) {
      alert("Errore durante l'avvio del viaggio")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEndTrip = async () => {
    setActionLoading(true)
    try {
      const coords = await getCoordinates()
      
      const res = await fetch(`/api/trips/${id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: coords.lat, 
          lng: coords.lng, 
          actualCraneHours, 
          driverNotes 
        })
      })

      if (res.ok) {
        setShowEndModal(false)
        fetchTrip()
      } else {
        alert("Errore durante il completamento del viaggio")
      }
    } catch (e) {
      alert("Errore durante il completamento del viaggio")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--color-saggin-bg)]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="p-6 text-[var(--color-saggin-text-primary)] bg-[var(--color-saggin-bg)] min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-medium text-[var(--color-saggin-text-secondary)]">Viaggio non trovato</p>
        <Link href="/my-trips" className="mt-4 px-4 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl text-sm">
          Torna ai viaggi
        </Link>
      </div>
    )
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
  const lat = trip.latitude || 45.71902
  const lng = trip.longitude || 11.67734
  const mapboxStaticUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+e31e24(${lng},${lat})/${lng},${lat},14,0/600x300@2x?access_token=${token}`

  return (
    <div className="min-h-screen bg-[var(--color-saggin-bg)] flex flex-col pb-28 text-[var(--color-saggin-text-primary)] font-sans relative">
      
      {/* HEADER SPECS: orario, stato, nome cliente/destinatario */}
      <div className="bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] p-4 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Link 
            href="/my-trips" 
            className="p-2.5 -ml-1 rounded-xl bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] hover:bg-slate-200 transition-colors shadow-2xs flex items-center justify-center"
            title="Torna all'elenco viaggi"
          >
            <ArrowLeft size={20} className="stroke-[2.5]" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider">
              Previsto:
            </span>
            <span className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
              {trip.scheduledTime}
            </span>
          </div>

          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-2xs",
            trip.status === 'DA_FARE' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            trip.status === 'IN_CORSO' ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse' :
            trip.status === 'COMPLETATO' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
            'bg-slate-100 border-slate-200 text-slate-600'
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              trip.status === 'DA_FARE' ? 'bg-blue-600' :
              trip.status === 'IN_CORSO' ? 'bg-amber-500' :
              trip.status === 'COMPLETATO' ? 'bg-emerald-600' :
              'bg-slate-500'
            )} />
            <span>
              {trip.status === 'DA_FARE' ? 'Da fare' :
               trip.status === 'IN_CORSO' ? 'In corso' :
               trip.status === 'COMPLETATO' ? 'Completato' : 'Annullato'}
            </span>
          </div>
        </div>

        {/* Cliente / Destinatario in evidenza nell'header */}
        <div className="pt-2 border-t border-[var(--color-saggin-border)]/60 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Building2 size={16} className="text-[var(--color-brand-red)] shrink-0" />
            <span className="text-base font-bold text-[var(--color-saggin-text-primary)] truncate">
              {trip.clientName || trip.contactName || 'Destinazione cantiere'}
            </span>
          </div>
          {trip.clientOrderNumber && (
            <span className="text-[11px] font-mono font-bold bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-primary)] px-2 py-0.5 rounded border border-[var(--color-saggin-border)] shrink-0 ml-2">
              #{trip.clientOrderNumber}
            </span>
          )}
        </div>
      </div>

      {/* LIVE TIMER BANNER SE IN CORSO */}
      {trip.status === 'IN_CORSO' && (
        <div className="bg-[var(--color-warning)]/10 border-b border-[var(--color-warning)]/30 p-3 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)] animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-warning)]">
              Lavoro attivo da:
            </span>
          </div>
          <div className="text-2xl font-bold font-space text-[var(--color-warning)] tracking-wider">
            {formatTimer(elapsedSeconds)}
          </div>
        </div>
      )}

      {/* BODY CONTENT */}
      <div className="p-4 space-y-4">
        
        {/* MAPPA MAPBOX & NAVIGATORE */}
        <div className="bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] overflow-hidden shadow-sm">
          {/* Mappa visiva */}
          <div className="relative h-44 w-full bg-[var(--color-saggin-bg)]">
            <img 
              src={mapboxStaticUrl} 
              alt="Mappa Destinazione" 
              className="w-full h-full object-cover"
              onError={(e: any) => {
                // Se Mapbox static dà errore, fallback su un pattern scuro minimale
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-saggin-surface)] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-3 left-3 bg-[var(--color-saggin-surface)]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[var(--color-saggin-border)] text-xs font-medium flex items-center gap-1.5">
              <MapPin size={14} className="text-[var(--color-brand-red)]" />
              Destinazione
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1">
                Indirizzo di Consegna
              </div>
              <div className="text-base font-medium text-[var(--color-saggin-text-primary)] leading-snug">
                {trip.address}
              </div>
            </div>

            {/* Bottone Naviga a tutta larghezza */}
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.address)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm text-sm"
            >
              <Navigation size={18} />
              <span>Avvia Navigatore (Google / Apple Maps)</span>
            </a>
          </div>
        </div>

        {/* DETTAGLI LAVORO (Materiale, Gru evidenziata, Mezzo, Note) */}
        <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)] space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
            Dettagli Trasporto
          </h2>

          {/* Materiale / Descrizione */}
          <div className="flex items-start gap-3">
            <Package size={20} className="text-[var(--color-saggin-text-secondary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Materiale</div>
              <div className="text-base font-semibold text-[var(--color-saggin-text-primary)]">
                {trip.cargoDescription}
              </div>
              {(trip.cargoWeight || trip.cargoLength) && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono">
                  {trip.cargoWeight && (
                    <span className="bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] px-2 py-1 rounded text-[var(--color-saggin-text-primary)]">
                      {trip.cargoWeight} kg
                    </span>
                  )}
                  {trip.cargoLength && (
                    <span className="bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] px-2 py-1 rounded text-[var(--color-saggin-text-primary)]">
                      {trip.cargoLength} × {trip.cargoWidth || '-'} × {trip.cargoHeight || '-'} m
                    </span>
                  )}
                  {trip.palletCount && (
                    <span className="bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] px-2 py-1 rounded text-[var(--color-saggin-text-primary)]">
                      {trip.palletCount} bancali
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* GRU EVIDENZIATA */}
          <div className={cn(
            "p-3.5 rounded-xl border flex items-center justify-between",
            trip.needsCrane 
              ? "bg-[var(--color-brand-red)]/10 border-[var(--color-brand-red)]/30 text-[var(--color-brand-red)]"
              : "bg-[var(--color-saggin-bg)] border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)]"
          )}>
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={20} className={trip.needsCrane ? "text-[var(--color-brand-red)]" : "text-zinc-600"} />
              <div>
                <div className="text-sm font-bold">
                  {trip.needsCrane ? 'Gru Richiesta: SÌ' : 'Gru Richiesta: NO'}
                </div>
                {trip.needsCrane && trip.craneWorkRadius && (
                  <div className="text-xs opacity-90">
                    Sbraccio operativo: {trip.craneWorkRadius} metri
                  </div>
                )}
              </div>
            </div>
            {trip.needsCrane && (
              <span className="bg-[var(--color-brand-red)] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                ATTENZIONE
              </span>
            )}
          </div>

          {/* MEZZO ASSEGNATO */}
          <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-saggin-border)]">
            <Truck size={20} className="text-[var(--color-saggin-text-secondary)] shrink-0" />
            <div>
              <div className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Mezzo Assegnato</div>
              <div className="text-sm font-semibold text-[var(--color-saggin-text-primary)]">
                {trip.vehicle?.name || 'Da definire'} {trip.vehicle?.licensePlate ? `(${trip.vehicle.licensePlate})` : ''}
              </div>
            </div>
          </div>

          {/* NUMERO IMPEGNO */}
          {trip.clientOrderNumber && (
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-saggin-border)]">
              <Hash size={20} className="text-[var(--color-saggin-text-secondary)] shrink-0" />
              <div>
                <div className="text-xs text-[var(--color-saggin-text-secondary)] font-medium">Numero Impegno Cliente</div>
                <div className="text-sm font-mono text-[var(--color-saggin-text-primary)]">
                  {trip.clientOrderNumber}
                </div>
              </div>
            </div>
          )}

          {/* NOTE UFFICIO */}
          {trip.notes && (
            <div className="pt-2 border-t border-[var(--color-saggin-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-saggin-text-secondary)] font-medium mb-1">
                <FileText size={14} />
                Note ufficio:
              </div>
              <p className="text-sm italic text-[var(--color-saggin-text-primary)] bg-[var(--color-saggin-bg)] p-3 rounded-lg border border-[var(--color-saggin-border)]">
                {trip.notes}
              </p>
            </div>
          )}
        </div>

        {/* CONTATTO CANTIERE & TELEFONO */}
        {(trip.contactName || trip.contactPhone) && (
          <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)] space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
              Contatto Cantiere
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-[var(--color-saggin-text-primary)]">
                  {trip.contactName || 'Referente cantiere'}
                </div>
                {trip.contactPhone && (
                  <div className="text-sm font-mono text-[var(--color-saggin-text-secondary)] mt-0.5">
                    {trip.contactPhone}
                  </div>
                )}
              </div>

              {trip.contactPhone && (
                <a 
                  href={`tel:${trip.contactPhone.replace(/\s+/g, '')}`}
                  className="px-4 py-2.5 bg-[var(--color-success)] hover:bg-[#329267] active:scale-95 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm text-sm"
                >
                  <Phone size={16} />
                  <span>Chiama</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* CHI HA CREATO IL VIAGGIO (IN FONDO ALLA SCHERMATA) */}
        <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-4 border border-[var(--color-saggin-border)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[var(--color-brand-red)] font-bold font-space text-base shadow-2xs">
              {(trip.createdByName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--color-saggin-text-secondary)] tracking-wider">
                Viaggio creato da
              </div>
              <div className="text-sm font-bold text-[var(--color-saggin-text-primary)]">
                {trip.createdByName || 'Ufficio Saggin'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-secondary)] px-2.5 py-1 rounded-lg border border-[var(--color-saggin-border)]">
            Ufficio
          </span>
        </div>

        {/* RIEPILOGO A LAVORO COMPLETATO */}
        {trip.status === 'COMPLETATO' && (
          <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-success)]/30 space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-success)] font-semibold text-sm">
              <CheckCircle size={18} />
              <span>Riepilogo Lavoro Registrato</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[var(--color-saggin-bg)] p-3 rounded-xl border border-[var(--color-saggin-border)]">
                <div className="text-xs text-[var(--color-saggin-text-secondary)]">Ora Inizio</div>
                <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                  {trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div className="bg-[var(--color-saggin-bg)] p-3 rounded-xl border border-[var(--color-saggin-border)]">
                <div className="text-xs text-[var(--color-saggin-text-secondary)]">Ora Fine</div>
                <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                  {trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>

              {trip.workedMinutes != null && (
                <div className="col-span-2 bg-[var(--color-saggin-bg)] p-3 rounded-xl border border-[var(--color-saggin-border)] flex justify-between items-center">
                  <span className="text-xs text-[var(--color-saggin-text-secondary)]">Tempo effettivo lavorato</span>
                  <span className="text-lg font-bold font-space text-[var(--color-success)]">
                    {Math.floor(trip.workedMinutes / 60)}h {trip.workedMinutes % 60}m
                  </span>
                </div>
              )}

              {trip.actualCraneHours && (
                <div className="col-span-2 bg-[var(--color-saggin-bg)] p-3 rounded-xl border border-[var(--color-saggin-border)] flex justify-between items-center">
                  <span className="text-xs text-[var(--color-saggin-text-secondary)]">Ore Gru effettive</span>
                  <span className="text-lg font-bold font-space text-[var(--color-brand-red)]">
                    {trip.actualCraneHours}h
                  </span>
                </div>
              )}
            </div>

            {trip.driverNotes && (
              <div className="pt-2 border-t border-[var(--color-saggin-border)]">
                <div className="text-xs text-[var(--color-saggin-text-secondary)] mb-1 font-medium">Note autista:</div>
                <p className="text-sm italic text-[var(--color-saggin-text-primary)] bg-[var(--color-saggin-bg)] p-3 rounded-lg border border-[var(--color-saggin-border)]">
                  {trip.driverNotes}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FIXED BOTTOM ACTION BUTTONS (STICKY AT PHONE BOTTOM) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-[var(--color-saggin-surface)]/95 backdrop-blur-md border-t border-[var(--color-saggin-border)] z-30 shadow-lg">
        <div className="max-w-md mx-auto">
          {trip.status === 'DA_FARE' && (
            <button
              disabled={actionLoading}
              onClick={handleStartTrip}
              className="w-full bg-[var(--color-success)] hover:bg-[#15803d] active:scale-[0.98] text-white text-lg font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2.5 cursor-pointer"
            >
              {actionLoading ? (
                <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <Play size={22} className="fill-white" />
                  <span>INIZIA LAVORO</span>
                </>
              )}
            </button>
          )}

          {trip.status === 'IN_CORSO' && (
            <button
              onClick={() => setShowEndModal(true)}
              className="w-full bg-[var(--color-brand-red)] hover:bg-[#b91c1c] active:scale-[0.98] text-white text-lg font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2.5 cursor-pointer animate-pulse"
            >
              <Check size={22} className="stroke-[3]" />
              <span>TERMINA LAVORO</span>
            </button>
          )}

          {trip.status === 'COMPLETATO' && (
            <div className="w-full bg-emerald-50 text-[var(--color-success)] border border-emerald-300 text-base font-bold py-3.5 rounded-2xl text-center flex justify-center items-center gap-2">
              <CheckCircle size={20} />
              <span>VIAGGIO COMPLETATO</span>
            </div>
          )}
        </div>
      </div>

      {/* END TRIP CONFIRMATION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-[var(--color-saggin-surface)] w-full max-w-md rounded-2xl p-6 border border-[var(--color-saggin-border)] shadow-2xl animate-in slide-in-from-bottom-6">
            <h2 className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)] mb-1">
              Concludi Viaggio
            </h2>
            <p className="text-sm text-[var(--color-saggin-text-secondary)] mb-6">
              Registra i dettagli finali del lavoro svolto.
            </p>
            
            {trip.needsCrane && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-2">
                  Ore utilizzo Gru effettive
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-saggin-text-secondary)] h-5 w-5" />
                  <input
                    type="number"
                    step="0.5"
                    value={actualCraneHours}
                    onChange={(e) => setActualCraneHours(e.target.value)}
                    placeholder="Es. 2.0"
                    className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-lg font-semibold rounded-xl py-3 pl-12 pr-4 focus:border-[var(--color-brand-red)] outline-none"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-2">
                Note autista / Eventuali problemi
              </label>
              <textarea
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="Nessun problema, scaricato regolarmente..."
                rows={3}
                className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-sm rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 text-sm font-semibold text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] rounded-xl hover:bg-[var(--color-saggin-elevated)] transition-colors"
              >
                Annulla
              </button>
              <button 
                type="button"
                onClick={handleEndTrip}
                disabled={actionLoading}
                className="flex-1 py-3 text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[#329267] rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm"
              >
                {actionLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Check size={18} />
                    <span>Conferma e Salva</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
