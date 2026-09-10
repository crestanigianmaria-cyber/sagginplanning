'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Clock, Plus, Calendar, CheckCircle2, AlertCircle, Wrench, 
  Hourglass, Truck, HelpCircle, X, ChevronRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ManualHour = {
  id: string
  date: string
  category: 'CARICO_SCARICO' | 'ATTESA' | 'MANUTENZIONE' | 'ALTRO'
  startTime?: string | null
  endTime?: string | null
  minutes: number
  note?: string | null
  status: 'DA_APPROVARE' | 'APPROVATO' | 'RIFIUTATO'
  createdAt: string
}

export default function HoursPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<any[]>([])
  const [manualHours, setManualHours] = useState<ManualHour[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [category, setCategory] = useState<'CARICO_SCARICO' | 'ATTESA' | 'MANUTENZIONE' | 'ALTRO'>('CARICO_SCARICO')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [entryMode, setEntryMode] = useState<'time' | 'duration'>('time')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:30')
  const [durationMinutes, setDurationMinutes] = useState('90')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const driverId = (session?.user as any)?.id

  const loadData = () => {
    if (!driverId) return
    Promise.all([
      fetch(`/api/trips?driverId=${driverId}`).then(r => r.json()),
      fetch(`/api/manual-hours?driverId=${driverId}`).then(r => r.json())
    ])
      .then(([tripsRes, manualRes]) => {
        if (tripsRes.success && Array.isArray(tripsRes.data)) {
          setTrips(tripsRes.data)
        }
        if (manualRes.success && Array.isArray(manualRes.data)) {
          setManualHours(manualRes.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [driverId])

  const handleCreateManualHour = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        driverId,
        date: new Date(date).toISOString(),
        category,
        note: note || undefined
      }

      if (entryMode === 'time') {
        payload.startTime = startTime
        payload.endTime = endTime
      } else {
        payload.minutes = parseInt(durationMinutes, 10)
      }

      const res = await fetch('/api/manual-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowAddModal(false)
        setNote('')
        loadData()
      } else {
        const err = await res.json()
        alert(err.error || 'Errore salvataggio ore')
      }
    } catch (e) {
      alert('Errore di connessione')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-[var(--color-saggin-bg)]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // CALCOLO ORE
  const completedTrips = trips.filter(t => t.status === 'COMPLETATO')
  
  // Totali Oggi
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTripsMinutes = completedTrips
    .filter(t => t.date?.startsWith(todayStr))
    .reduce((sum, t) => sum + (t.workedMinutes || 0), 0)

  const todayManualMinutes = manualHours
    .filter(m => m.date?.startsWith(todayStr))
    .reduce((sum, m) => sum + (m.minutes || 0), 0)

  const totalTodayMinutes = todayTripsMinutes + todayManualMinutes
  const totalTodayHours = (totalTodayMinutes / 60).toFixed(1)

  // Totali per Categoria (Tutti i tempi recenti)
  const categoryMinutes = {
    VIAGGI: completedTrips.reduce((sum, t) => sum + (t.workedMinutes || 0), 0),
    CARICO_SCARICO: manualHours.filter(m => m.category === 'CARICO_SCARICO').reduce((sum, m) => sum + m.minutes, 0),
    ATTESA: manualHours.filter(m => m.category === 'ATTESA').reduce((sum, m) => sum + m.minutes, 0),
    MANUTENZIONE: manualHours.filter(m => m.category === 'MANUTENZIONE').reduce((sum, m) => sum + m.minutes, 0),
    ALTRO: manualHours.filter(m => m.category === 'ALTRO').reduce((sum, m) => sum + m.minutes, 0),
  }

  const grandTotalMinutes = Object.values(categoryMinutes).reduce((a, b) => a + b, 0)
  const grandTotalHours = (grandTotalMinutes / 60).toFixed(1)

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'CARICO_SCARICO': return 'Carico / Scarico'
      case 'ATTESA': return 'Attesa Cantiere'
      case 'MANUTENZIONE': return 'Manutenzione'
      case 'ALTRO': return 'Altro'
      default: return cat
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CARICO_SCARICO': return <Truck size={16} className="text-blue-400" />
      case 'ATTESA': return <Hourglass size={16} className="text-[var(--color-warning)]" />
      case 'MANUTENZIONE': return <Wrench size={16} className="text-purple-400" />
      case 'ALTRO': return <HelpCircle size={16} className="text-zinc-400" />
      default: return <Clock size={16} />
    }
  }

  return (
    <div className="p-4 space-y-5 font-sans pb-24">
      {/* HEADER & ACTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            Gestione Ore
          </h1>
          <p className="text-xs text-[var(--color-saggin-text-secondary)] mt-0.5">
            Riepilogo viaggi ed inserimento ore manuali
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>+ Aggiungi ore</span>
        </button>
      </div>

      {/* KPI TOTALE OGGI */}
      <section className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)]">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
            Totale Lavorato Oggi
          </span>
          <span className="text-xs font-mono bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-secondary)] px-2 py-0.5 rounded border border-[var(--color-saggin-border)]">
            {todayTripsMinutes ? `${(todayTripsMinutes / 60).toFixed(1)}h viaggi` : '0h viaggi'} + {(todayManualMinutes / 60).toFixed(1)}h manuali
          </span>
        </div>

        <div className="text-5xl font-bold font-space text-[var(--color-saggin-text-primary)] mb-3">
          {totalTodayHours} <span className="text-xl text-[var(--color-saggin-text-secondary)] font-medium">/ 8h</span>
        </div>

        <div className="w-full bg-[var(--color-saggin-bg)] rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-[var(--color-brand-red)] h-2.5 rounded-full transition-all" 
            style={{ width: `${Math.min(100, (parseFloat(totalTodayHours) / 8) * 100)}%` }} 
          />
        </div>
      </section>

      {/* RIEPILOGO DETTAGLIO PER CATEGORIA */}
      <section className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)] space-y-3">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
            Dettaglio per Categoria
          </h2>
          <span className="text-xs font-bold font-space text-[var(--color-saggin-text-primary)]">
            Totale: {grandTotalHours}h
          </span>
        </div>

        <div className="space-y-2">
          {/* Viaggi effettivi */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
            <div className="flex items-center gap-2.5">
              <Truck size={18} className="text-[var(--color-success)]" />
              <span className="text-sm font-medium text-[var(--color-saggin-text-primary)]">Viaggi Effettuati</span>
            </div>
            <span className="text-sm font-bold font-space text-[var(--color-success)]">
              {(categoryMinutes.VIAGGI / 60).toFixed(1)}h
            </span>
          </div>

          {/* Carico / Scarico */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
            <div className="flex items-center gap-2.5">
              <Truck size={18} className="text-blue-400" />
              <span className="text-sm font-medium text-[var(--color-saggin-text-primary)]">Carico / Scarico</span>
            </div>
            <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
              {(categoryMinutes.CARICO_SCARICO / 60).toFixed(1)}h
            </span>
          </div>

          {/* Attesa Cantiere */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
            <div className="flex items-center gap-2.5">
              <Hourglass size={18} className="text-[var(--color-warning)]" />
              <span className="text-sm font-medium text-[var(--color-saggin-text-primary)]">Attesa in Cantiere</span>
            </div>
            <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
              {(categoryMinutes.ATTESA / 60).toFixed(1)}h
            </span>
          </div>

          {/* Manutenzione */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
            <div className="flex items-center gap-2.5">
              <Wrench size={18} className="text-purple-400" />
              <span className="text-sm font-medium text-[var(--color-saggin-text-primary)]">Manutenzione Mezzo</span>
            </div>
            <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
              {(categoryMinutes.MANUTENZIONE / 60).toFixed(1)}h
            </span>
          </div>

          {/* Altro */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
            <div className="flex items-center gap-2.5">
              <HelpCircle size={18} className="text-zinc-400" />
              <span className="text-sm font-medium text-[var(--color-saggin-text-primary)]">Altro</span>
            </div>
            <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
              {(categoryMinutes.ALTRO / 60).toFixed(1)}h
            </span>
          </div>
        </div>
      </section>

      {/* REGISTRO ORE MANUALI INSERITE */}
      <section className="bg-[var(--color-saggin-surface)] rounded-2xl p-5 border border-[var(--color-saggin-border)] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">
            Le tue ore manuali
          </h2>
          <span className="text-xs text-[var(--color-saggin-text-secondary)]">
            {manualHours.length} registrazioni
          </span>
        </div>

        {manualHours.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--color-saggin-text-secondary)] border border-dashed border-[var(--color-saggin-border)] rounded-xl">
            Nessuna ora manuale inserita.
          </div>
        ) : (
          <div className="space-y-3">
            {manualHours.map((entry) => (
              <div 
                key={entry.id}
                className="p-3.5 rounded-xl bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(entry.category)}
                    <span className="text-sm font-semibold text-[var(--color-saggin-text-primary)]">
                      {getCategoryLabel(entry.category)}
                    </span>
                  </div>

                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded border",
                    entry.status === 'APPROVATO' ? "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]" :
                    entry.status === 'RIFIUTATO' ? "bg-red-900/20 border-red-500/30 text-red-400" :
                    "bg-[var(--color-warning)]/15 border-[var(--color-warning)]/40 text-[var(--color-warning)]"
                  )}>
                    {entry.status === 'APPROVATO' ? 'Approvato' :
                     entry.status === 'RIFIUTATO' ? 'Rifiutato' : 'In attesa'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[var(--color-saggin-text-secondary)]">
                  <span>
                    {new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    {entry.startTime && entry.endTime ? ` (${entry.startTime} - ${entry.endTime})` : ''}
                  </span>
                  <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
                    {Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m
                  </span>
                </div>

                {entry.note && (
                  <p className="text-xs italic text-[var(--color-saggin-text-secondary)] pt-1 border-t border-[var(--color-saggin-border)]/50">
                    "{entry.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL INSERIMENTO ORE MANUALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--color-saggin-surface)] w-full max-w-md rounded-2xl p-6 border border-[var(--color-saggin-border)] shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-space text-[var(--color-saggin-text-primary)]">
                Aggiungi Ore Manuali
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateManualHour} className="space-y-4">
              {/* Data */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-1.5">
                  Data
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-sm rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-sm rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none"
                >
                  <option value="CARICO_SCARICO">Carico / Scarico merce</option>
                  <option value="ATTESA">Attesa in cantiere / fermo</option>
                  <option value="MANUTENZIONE">Manutenzione / lavaggio mezzo</option>
                  <option value="ALTRO">Altro lavoro</option>
                </select>
              </div>

              {/* Toggle Modalità: Inizio-Fine o Durata */}
              <div className="flex rounded-xl bg-[var(--color-saggin-bg)] p-1 border border-[var(--color-saggin-border)]">
                <button
                  type="button"
                  onClick={() => setEntryMode('time')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    entryMode === 'time' ? "bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] shadow-sm" : "text-[var(--color-saggin-text-secondary)]"
                  )}
                >
                  Orario Inizio - Fine
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('duration')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    entryMode === 'duration' ? "bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] shadow-sm" : "text-[var(--color-saggin-text-secondary)]"
                  )}
                >
                  Durata Totale
                </button>
              </div>

              {entryMode === 'time' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-saggin-text-secondary)] mb-1 font-medium">Ora Inizio</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-base font-semibold rounded-xl p-2.5 text-center focus:border-[var(--color-brand-red)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-saggin-text-secondary)] mb-1 font-medium">Ora Fine</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-base font-semibold rounded-xl p-2.5 text-center focus:border-[var(--color-brand-red)] outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-[var(--color-saggin-text-secondary)] mb-1 font-medium">Durata in Minuti</label>
                  <input 
                    type="number" 
                    step="15"
                    min="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                    placeholder="Es. 90 (per 1h 30m)"
                    className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-base font-semibold rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none"
                  />
                </div>
              )}

              {/* Nota opzionale */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-1.5">
                  Note aggiuntive (opzionale)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es. Attesa gruista in cantiere a Vicenza..."
                  rows={2}
                  className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-sm rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none resize-none"
                />
              </div>

              {/* Bottoni Salva / Annulla */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-xs font-semibold text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] rounded-xl hover:bg-[var(--color-saggin-elevated)] transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[var(--color-brand-red)] hover:bg-[#b91c1c] rounded-xl transition-all flex justify-center items-center gap-1.5 shadow-sm"
                >
                  {submitting ? 'Salvataggio...' : 'Registra Ore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
