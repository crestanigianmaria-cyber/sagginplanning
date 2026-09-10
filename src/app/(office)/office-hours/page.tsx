'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Clock, CheckCircle, XCircle, Edit2, AlertCircle, 
  Truck, User, Calendar, Filter, ChevronRight, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OfficeHoursPage() {
  const { data: session } = useSession()
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all')
  const [manualHours, setManualHours] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<any | null>(null)
  const [editMinutes, setEditMinutes] = useState('')
  const [editNote, setEditNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    const driverParam = selectedDriverId !== 'all' ? `?driverId=${selectedDriverId}` : ''
    
    Promise.all([
      fetch('/api/drivers').then(r => r.json()),
      fetch(`/api/manual-hours${driverParam}`).then(r => r.json()),
      fetch(`/api/trips${driverParam}`).then(r => r.json())
    ])
      .then(([driversRes, hoursRes, tripsRes]) => {
        if (driversRes.success && Array.isArray(driversRes.data)) {
          setDrivers(driversRes.data)
        }
        if (hoursRes.success && Array.isArray(hoursRes.data)) {
          setManualHours(hoursRes.data)
        }
        if (tripsRes.success && Array.isArray(tripsRes.data)) {
          setTrips(tripsRes.data.filter((t: any) => t.status === 'COMPLETATO'))
        }
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [selectedDriverId])

  const handleUpdateStatus = async (id: string, status: 'APPROVATO' | 'RIFIUTATO') => {
    try {
      const res = await fetch(`/api/manual-hours/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setManualHours(prev => prev.map(item => item.id === id ? { ...item, status } : item))
      } else {
        alert('Errore durante l\'aggiornamento dello stato')
      }
    } catch (e) {
      alert('Errore di connessione')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEntry) return
    setActionLoading(true)

    try {
      const res = await fetch(`/api/manual-hours/${editingEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: parseInt(editMinutes, 10),
          note: editNote
        })
      })

      if (res.ok) {
        const updated = await res.json()
        setManualHours(prev => prev.map(item => item.id === editingEntry.id ? updated.data : item))
        setEditingEntry(null)
      } else {
        alert('Errore durante il salvataggio')
      }
    } catch (e) {
      alert('Errore di connessione')
    } finally {
      setActionLoading(false)
    }
  }

  // Totali
  const totalTripMinutes = trips.reduce((sum, t) => sum + (t.workedMinutes || 0), 0)
  const totalManualMinutes = manualHours.reduce((sum, h) => sum + h.minutes, 0)
  const grandTotalHours = ((totalTripMinutes + totalManualMinutes) / 60).toFixed(1)
  const pendingCount = manualHours.filter(h => h.status === 'DA_APPROVARE').length

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            Validazione Ore Autisti
          </h1>
          <p className="text-sm text-[var(--color-saggin-text-secondary)] mt-1">
            Controlla e valida le ore registrate automaticamente dai viaggi e quelle inserite manualmente.
          </p>
        </div>

        {/* Filtro Autista */}
        <div className="flex items-center gap-2 bg-[var(--color-saggin-surface)] p-2 rounded-xl border border-[var(--color-saggin-border)]">
          <Filter size={16} className="text-[var(--color-saggin-text-secondary)] ml-2" />
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[var(--color-saggin-text-primary)] outline-none pr-3 cursor-pointer"
          >
            <option value="all" className="bg-[var(--color-saggin-surface)]">Tutti gli autisti</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id} className="bg-[var(--color-saggin-surface)]">
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-saggin-surface)] p-5 rounded-2xl border border-[var(--color-saggin-border)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1">
            Ore Totali Lavorate
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {grandTotalHours}h
          </div>
          <div className="text-xs text-[var(--color-saggin-text-secondary)] mt-1">
            {(totalTripMinutes / 60).toFixed(1)}h viaggi + {(totalManualMinutes / 60).toFixed(1)}h manuali
          </div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-5 rounded-2xl border border-[var(--color-saggin-border)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1">
            Ore da Viaggi Effettivi
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-success)]">
            {(totalTripMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-xs text-[var(--color-saggin-text-secondary)] mt-1">
            {trips.length} viaggi completati
          </div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-5 rounded-2xl border border-[var(--color-saggin-border)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1">
            Ore Manuali Dichiarate
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {(totalManualMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-xs text-[var(--color-saggin-text-secondary)] mt-1">
            {manualHours.length} registrazioni manuali
          </div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-5 rounded-2xl border border-[var(--color-warning)]/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-warning)]" />
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-warning)] mb-1">
            Da Convalidare
          </div>
          <div className="text-3xl font-bold font-space text-[var(--color-warning)]">
            {pendingCount}
          </div>
          <div className="text-xs text-[var(--color-saggin-text-secondary)] mt-1">
            {pendingCount === 0 ? 'Tutte le ore convalidate' : 'Richiedono approvazione'}
          </div>
        </div>
      </div>

      {/* TABELLA ORE MANUALI */}
      <div className="bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] overflow-hidden">
        <div className="p-5 border-b border-[var(--color-saggin-border)] flex justify-between items-center">
          <h2 className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
            Registro Ore Manuali da Validare
          </h2>
          <span className="text-xs font-medium text-[var(--color-saggin-text-secondary)]">
            {manualHours.length} voci trovate
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--color-brand-red)] border-t-transparent rounded-full" />
          </div>
        ) : manualHours.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--color-saggin-text-secondary)]">
            Nessuna ora manuale registrata per i filtri selezionati.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-saggin-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-bg)]">
                  <th className="py-3 px-4">Autista</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Orario / Durata</th>
                  <th className="py-3 px-4">Note Autista</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-saggin-border)] text-sm">
                {manualHours.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--color-saggin-bg)]/50 transition-colors">
                    {/* Autista */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {entry.driver?.profilePicture ? (
                          <img 
                            src={entry.driver.profilePicture} 
                            alt={entry.driver.name} 
                            className="w-7 h-7 rounded-full object-cover border border-[var(--color-saggin-border)]"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--color-saggin-elevated)] flex items-center justify-center font-bold text-xs">
                            {entry.driver?.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <span className="font-semibold text-[var(--color-saggin-text-primary)]">
                          {entry.driver?.name || 'Autista sconosciuto'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-3 px-4 text-xs text-[var(--color-saggin-text-secondary)] font-mono">
                      {new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)]">
                        {entry.category === 'CARICO_SCARICO' ? 'Carico / Scarico' :
                         entry.category === 'ATTESA' ? 'Attesa Cantiere' :
                         entry.category === 'MANUTENZIONE' ? 'Manutenzione' : 'Altro'}
                      </span>
                    </td>

                    {/* Durata */}
                    <td className="py-3 px-4">
                      <div className="font-bold font-space text-[var(--color-saggin-text-primary)]">
                        {Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m
                      </div>
                      {entry.startTime && entry.endTime && (
                        <div className="text-[11px] text-[var(--color-saggin-text-secondary)] font-mono">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4 text-xs italic text-[var(--color-saggin-text-secondary)] max-w-xs truncate">
                      {entry.note || '-'}
                    </td>

                    {/* Stato */}
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1",
                        entry.status === 'APPROVATO' ? "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]" :
                        entry.status === 'RIFIUTATO' ? "bg-red-900/20 border-red-500/30 text-red-400" :
                        "bg-[var(--color-warning)]/15 border-[var(--color-warning)]/40 text-[var(--color-warning)]"
                      )}>
                        {entry.status === 'APPROVATO' ? 'Convalidato' :
                         entry.status === 'RIFIUTATO' ? 'Rifiutato' : 'In attesa'}
                      </span>
                    </td>

                    {/* Azioni */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.status !== 'APPROVATO' && (
                          <button
                            onClick={() => handleUpdateStatus(entry.id, 'APPROVATO')}
                            className="p-1.5 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)] text-[var(--color-success)] hover:text-white rounded-lg transition-colors"
                            title="Approva e convalida"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {entry.status !== 'RIFIUTATO' && (
                          <button
                            onClick={() => handleUpdateStatus(entry.id, 'RIFIUTATO')}
                            className="p-1.5 bg-red-900/10 hover:bg-red-700 text-red-400 hover:text-white rounded-lg transition-colors"
                            title="Rifiuta"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingEntry(entry)
                            setEditMinutes(entry.minutes.toString())
                            setEditNote(entry.note || '')
                          }}
                          className="p-1.5 bg-[var(--color-saggin-bg)] hover:bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] rounded-lg transition-colors"
                          title="Modifica minuti o note"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--color-saggin-surface)] w-full max-w-md rounded-2xl p-6 border border-[var(--color-saggin-border)] shadow-2xl">
            <h3 className="text-xl font-bold font-space text-[var(--color-saggin-text-primary)] mb-1">
              Correggi Ore Autista
            </h3>
            <p className="text-xs text-[var(--color-saggin-text-secondary)] mb-5">
              Autista: <span className="font-semibold text-[var(--color-saggin-text-primary)]">{editingEntry.driver?.name}</span>
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1.5">
                  Minuti effettivi convalidati
                </label>
                <input 
                  type="number"
                  step="15"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  required
                  className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-lg font-bold font-space rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none"
                />
                <span className="text-xs text-[var(--color-saggin-text-secondary)] mt-1 block font-mono">
                  = {Math.floor(parseInt(editMinutes || '0', 10) / 60)}h {parseInt(editMinutes || '0', 10) % 60}m
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)] mb-1.5">
                  Nota correzione (motivazione)
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] text-sm rounded-xl p-3 focus:border-[var(--color-brand-red)] outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2.5 text-xs font-semibold text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)] rounded-xl hover:bg-[var(--color-saggin-elevated)]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[var(--color-brand-red)] hover:bg-[#b91c1c] rounded-xl transition-all shadow-sm"
                >
                  {actionLoading ? 'Salvataggio...' : 'Salva Correzione'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
