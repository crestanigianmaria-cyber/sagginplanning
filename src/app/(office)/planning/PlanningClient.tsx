'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Truck, 
  AlertCircle, 
  Loader2, 
  X, 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  User, 
  Columns3, 
  LayoutGrid, 
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { cn, getDriverAvatar } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import TripForm from '@/components/trips/TripForm';

const WEEK_DAYS = [
  { id: 1, name: 'Lunedì', short: 'Lun' },
  { id: 2, name: 'Martedì', short: 'Mar' },
  { id: 3, name: 'Mercoledì', short: 'Mer' },
  { id: 4, name: 'Giovedì', short: 'Gio' },
  { id: 5, name: 'Venerdì', short: 'Ven' },
  { id: 6, name: 'Sabato', short: 'Sab' },
  { id: 7, name: 'Domenica', short: 'Dom' }
];

export function formatLocalDateStr(d: Date | string): string {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay() || 7; // Lunedì = 1, Domenica = 7
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - (day - 1));
  monday.setHours(12, 0, 0, 0); // Mezzogiorno per evitare shift di fuso orario

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function PlanningClient({ 
  initialDrivers = [], 
  initialVehicles = [], 
  initialTrips = [] 
}: any) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 7);
  const [viewMode, setViewMode] = useState<'columns' | 'matrix'>('columns');
  const [trips, setTrips] = useState<any[]>(initialTrips || []);
  const [unassignedTrips, setUnassignedTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDriverForNewTrip, setSelectedDriverForNewTrip] = useState<string | undefined>(undefined);
  const [selectedDateForNewTrip, setSelectedDateForNewTrip] = useState<string | undefined>(undefined);

  // Drag and drop state
  const [draggedTripId, setDraggedTripId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const mondayStr = useMemo(() => formatLocalDateStr(weekDates[0]), [weekDates]);
  const todayStr = useMemo(() => formatLocalDateStr(new Date()), []);

  const fetchWeekTrips = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trips?weekStart=${mondayStr}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTrips(data.data);
      }
    } catch (e) {
      console.error('Error fetching week trips:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnassignedTrips = async () => {
    try {
      const res = await fetch('/api/trips?unassigned=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUnassignedTrips(data.data);
      }
    } catch (e) {
      console.error('Error fetching unassigned trips:', e);
    }
  };

  useEffect(() => {
    fetchWeekTrips();
    fetchUnassignedTrips();
  }, [mondayStr]);

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const setToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDay() || 7);
  };

  const getWeekString = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const handleAddTrip = (driverId?: string, specificDateStr?: string) => {
    setSelectedTripId(null);
    setSelectedDriverForNewTrip(driverId);
    setSelectedDateForNewTrip(specificDateStr || formatLocalDateStr(weekDates[selectedDay - 1]));
    setShowModal(true);
  };

  const handleTripClick = (tripId: string) => {
    setSelectedTripId(tripId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTripId(null);
    setSelectedDriverForNewTrip(undefined);
    setSelectedDateForNewTrip(undefined);
  };

  const handleSave = async (payload: any) => {
    try {
      const method = selectedTripId ? 'PUT' : 'POST';
      const url = selectedTripId ? `/api/trips/${selectedTripId}` : '/api/trips';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchWeekTrips();
        fetchUnassignedTrips();
      } else {
        alert(data.error || 'Errore durante il salvataggio');
      }
    } catch (e: any) {
      alert(e.message || 'Errore durante il salvataggio del viaggio');
    }
  };

  // Spostamento viaggio tramite Drag & Drop (cambio autista e/o data)
  const handleMoveTrip = async (tripId: string, newDriverId: string | null, newDateStr?: string) => {
    try {
      const payload: any = { driverId: newDriverId };
      if (newDateStr) {
        payload.date = new Date(`${newDateStr}T12:00:00.000Z`).toISOString();
      }

      // Aggiornamento ottimistico dell'interfaccia
      if (newDriverId === null) {
        const found = trips.find(t => t.id === tripId);
        if (found) {
          setTrips(prev => prev.filter(t => t.id !== tripId));
          setUnassignedTrips(prev => [{ ...found, driverId: null, driver: null }, ...prev]);
        }
      } else {
        const unassignedFound = unassignedTrips.find(t => t.id === tripId);
        const targetDriver = initialDrivers.find((d: any) => d.id === newDriverId);
        if (unassignedFound) {
          setUnassignedTrips(prev => prev.filter(t => t.id !== tripId));
          setTrips(prev => [...prev, { ...unassignedFound, driverId: newDriverId, driver: targetDriver, ...(newDateStr ? { date: payload.date } : {}) }]);
        } else {
          setTrips(prev => prev.map(t => {
            if (t.id === tripId) {
              return { ...t, driverId: newDriverId, driver: targetDriver, ...(newDateStr ? { date: payload.date } : {}) };
            }
            return t;
          }));
        }
      }

      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || data.error || 'Impossibile riassegnare il viaggio');
        fetchWeekTrips();
        fetchUnassignedTrips();
      }
    } catch (e) {
      console.error('Drag and drop move error:', e);
      fetchWeekTrips();
      fetchUnassignedTrips();
    }
  };

  // Viaggi filtrati per il giorno selezionato (nella vista a colonne)
  const selectedDayDate = weekDates[selectedDay - 1];
  const selectedDayDateStr = formatLocalDateStr(selectedDayDate);
  const currentDayTrips = useMemo(() => {
    return trips.filter(t => formatLocalDateStr(t.date) === selectedDayDateStr);
  }, [trips, selectedDayDateStr]);

  // Conteggio viaggi per giorno della settimana per visualizzarlo nei bottoni calendario
  const tripsCountByDay = useMemo(() => {
    const counts: Record<number, number> = {};
    weekDates.forEach((d, idx) => {
      const dStr = formatLocalDateStr(d);
      counts[idx + 1] = trips.filter(t => formatLocalDateStr(t.date) === dStr && t.driverId).length;
    });
    return counts;
  }, [trips, weekDates]);

  // Conteggio totale viaggi assegnati della settimana
  const totalWeekAssignedTrips = useMemo(() => {
    return trips.filter(t => t.driverId).length;
  }, [trips]);

  const selectedTripForModal = useMemo(() => {
    if (!selectedTripId) return null;
    return trips.find(t => t.id === selectedTripId) || unassignedTrips.find(t => t.id === selectedTripId) || null;
  }, [selectedTripId, trips, unassignedTrips]);

  return (
    <div className="h-full flex flex-col space-y-3 font-sans relative min-h-0">
      
      {/* BARRA DI CONTROLLO PLANNING PRINCIPALE */}
      <div className="bg-[var(--color-saggin-surface)] px-4 py-2.5 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        
        {/* Sinistra: Titolo, Badge e Tasto Nuovo Viaggio */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-lg border border-red-200">
              <Calendar className="h-5 w-5 text-[var(--color-brand-red)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">
                  Planning Settimanale
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {totalWeekAssignedTrips} corse attive
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-saggin-text-secondary)] font-medium">
                Trascina le corse tra autisti o giorni con il mouse (Drag & Drop)
              </p>
            </div>
          </div>

          <button 
            onClick={() => handleAddTrip(undefined, selectedDayDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95 ml-auto sm:ml-0"
          >
            <Plus size={15} />
            <span>Nuovo Viaggio</span>
          </button>
        </div>
        
        {/* Centro: Navigatore Settimana */}
        <div className="flex items-center gap-1 bg-[var(--color-saggin-elevated)] p-1 rounded-xl border border-[var(--color-saggin-border)] self-start xl:self-center">
          <button 
            onClick={() => changeWeek('prev')}
            className="p-1.5 hover:bg-white rounded-lg text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all shadow-2xs"
            title="Settimana precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="font-bold font-space text-xs px-3 min-w-[170px] text-center text-[var(--color-saggin-text-primary)]">
            {getWeekString()}
          </span>
          
          <button 
            onClick={() => changeWeek('next')}
            className="p-1.5 hover:bg-white rounded-lg text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all shadow-2xs"
            title="Settimana successiva"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="w-px h-4 bg-[var(--color-saggin-border)] mx-0.5" />
          
          <button 
            onClick={setToday}
            className={cn(
              "px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border",
              weekDates.some(d => formatLocalDateStr(d) === todayStr)
                ? "text-[var(--color-brand-red)] bg-red-50/80 border-red-200 font-extrabold"
                : "text-slate-600 hover:text-[var(--color-brand-red)] hover:bg-white border-transparent"
            )}
          >
            Oggi
          </button>
        </div>

        {/* Destra: Switcher Visualizzazione (Giornaliera vs Griglia Settimanale) */}
        <div className="flex items-center gap-1.5 bg-[var(--color-saggin-elevated)] p-1 rounded-xl border border-[var(--color-saggin-border)] self-start xl:self-center">
          <button
            onClick={() => setViewMode('columns')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'columns'
                ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs border border-slate-200"
                : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
            )}
            title="Vista Giornaliera (Colonnare per autista)"
          >
            <Columns3 size={14} className={viewMode === 'columns' ? 'text-[var(--color-brand-red)]' : ''} />
            <span>Vista Giornaliera</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'matrix'
                ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs border border-slate-200"
                : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
            )}
            title="Griglia Settimanale (Matrice completa Autisti x Giorni)"
          >
            <LayoutGrid size={14} className={viewMode === 'matrix' ? 'text-[var(--color-brand-red)]' : ''} />
            <span>Griglia Settimana</span>
          </button>
        </div>
      </div>

      {/* BARRA GIORNI DELLA SETTIMANA (Solo in modalità Giornaliera) */}
      {viewMode === 'columns' && (
        <div className="bg-[var(--color-saggin-surface)] p-1.5 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs shrink-0 flex items-center gap-1.5 overflow-x-auto">
          {WEEK_DAYS.map((day, idx) => {
            const isSelected = selectedDay === day.id;
            const dayDate = weekDates[idx];
            const isToday = formatLocalDateStr(dayDate) === todayStr;
            const tripsCount = tripsCountByDay[day.id] || 0;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={cn(
                  "flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold transition-all border flex items-center justify-between gap-2 text-left relative overflow-hidden",
                  isSelected
                    ? "bg-[var(--color-brand-red)] text-white border-[var(--color-brand-red)] shadow-xs"
                    : "bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)] hover:border-slate-400 hover:text-[var(--color-saggin-text-primary)]"
                )}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("font-bold", isSelected ? "text-white" : "text-[var(--color-saggin-text-primary)]")}>
                      {day.name}
                    </span>
                    {isToday && (
                      <span className={cn(
                        "text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded tracking-wider",
                        isSelected ? "bg-white text-[var(--color-brand-red)]" : "bg-red-100 text-[var(--color-brand-red)]"
                      )}>
                        Oggi
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[11px] font-mono mt-0.5",
                    isSelected ? "text-white/90" : "text-slate-400"
                  )}>
                    {dayDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                {/* Badge Conteggio Viaggi del Giorno */}
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold font-mono shrink-0",
                  isSelected 
                    ? "bg-white/20 text-white" 
                    : tripsCount > 0 
                      ? "bg-slate-100 text-slate-700 border border-slate-200" 
                      : "bg-slate-50 text-slate-300 border border-slate-100"
                )}>
                  {tripsCount} {tripsCount === 1 ? 'corsa' : 'corse'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* CONTENUTO PLANNING: VISTA A COLONNE (KANBAN) CON DRAG & DROP */}
      {viewMode === 'columns' && (
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] relative shadow-xs">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-saggin-text-secondary)]">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-[var(--color-brand-red)]" />
              <p className="font-semibold text-sm">Aggiornamento planning in corso...</p>
            </div>
          ) : (
            <div className="h-full flex min-w-max divide-x divide-[var(--color-saggin-border)]">
              
              {/* COLONNA: VIAGGI DA ASSEGNARE (DROP TARGET PER RIMUOVERE ASSEGNAZIONE) */}
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverTarget('unassigned');
                }}
                onDragLeave={() => {
                  if (dragOverTarget === 'unassigned') setDragOverTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const raw = e.dataTransfer.getData('text/plain');
                  if (!raw) return;
                  const data = JSON.parse(raw);
                  handleMoveTrip(data.tripId, null);
                  setDragOverTarget(null);
                }}
                className={cn(
                  "w-80 xl:w-84 flex-shrink-0 flex flex-col h-full transition-colors relative",
                  dragOverTarget === 'unassigned' ? "bg-red-100/50 ring-2 ring-inset ring-[var(--color-brand-red)]" : "bg-red-50/20"
                )}
              >
                <div className="p-3.5 border-b border-red-200/80 bg-red-50/70 sticky top-0 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-red)] text-white flex items-center justify-center shadow-2xs">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs font-space text-[var(--color-brand-red)] uppercase tracking-wider">
                        Da Assegnare
                      </h3>
                      <p className="text-[10px] text-red-600 font-medium">Trascina qui per disassegnare</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-[var(--color-brand-red)] border border-red-200 font-mono">
                    {unassignedTrips.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {unassignedTrips.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-red-200 rounded-xl text-xs text-red-500 font-medium bg-white/60">
                      Nessun viaggio in attesa di assegnazione
                    </div>
                  ) : (
                    unassignedTrips.map((trip: any) => (
                      <div 
                        key={trip.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({ tripId: trip.id, sourceDriverId: null }));
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTripId(trip.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTripId(null);
                          setDragOverTarget(null);
                        }}
                        onClick={() => handleTripClick(trip.id)}
                        className={cn(
                          "bg-white border border-red-200 hover:border-[var(--color-brand-red)] p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all shadow-2xs hover:shadow-xs relative overflow-hidden group select-none",
                          draggedTripId === trip.id && "opacity-40 ring-2 ring-[var(--color-brand-red)] scale-95"
                        )}
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[var(--color-brand-red)]" />
                        
                        <div className="flex justify-between items-center mb-2 pl-1.5">
                          <div className="flex items-center gap-1.5 text-[var(--color-brand-red)] font-bold font-space text-sm">
                            <GripVertical size={13} className="text-red-400 opacity-60 group-hover:opacity-100" />
                            <Clock size={13} />
                            <span>{trip.scheduledTime || 'Orario N/D'}</span>
                          </div>
                          {trip.date && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100/80 text-[var(--color-brand-red)] border border-red-200 font-mono">
                              📅 {new Date(trip.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>

                        <div className="pl-1.5 space-y-1.5">
                          {trip.clientName ? (
                            <>
                              <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-1">
                                {trip.clientName}
                              </div>
                              <div className="text-[11px] text-[var(--color-saggin-text-secondary)] font-medium line-clamp-1">
                                {trip.cargoDescription}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-2">
                              {trip.cargoDescription}
                            </div>
                          )}

                          <div className="flex items-start gap-1 text-[11px] text-slate-500 line-clamp-1">
                            <MapPin size={12} className="shrink-0 mt-0.5 text-red-500" />
                            <span className="truncate">{trip.address}</span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] pl-1.5">
                          <span className="text-slate-500 font-medium truncate">
                            {trip.vehicle?.name || 'Mezzo da scegliere'}
                          </span>
                          {trip.needsCrane && (
                            <span className="bg-red-50 text-[var(--color-brand-red)] font-bold px-1.5 py-0.5 rounded text-[9px] border border-red-200">
                              GRU
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-red-100/60 flex items-center justify-between text-[10px] pl-1.5 text-slate-500">
                          <div className="flex items-center gap-1">
                            <User size={11} className="text-[var(--color-brand-red)]" />
                            <span>Creato da:</span>
                            <strong className="text-[var(--color-saggin-text-primary)]">
                              {trip.createdByName || trip.auditLogs?.find((a: any) => a.action === 'CREATE')?.officeUser?.name || 'Ufficio'}
                            </strong>
                          </div>
                        </div>

                        {/* Tasto Rapido Assegnazione */}
                        <div className="mt-2.5 pt-2 border-t border-dashed border-red-200">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTripClick(trip.id);
                            }}
                            className="w-full py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <span>Assegna Autista</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  <button 
                    onClick={() => handleAddTrip(undefined, selectedDayDateStr)}
                    className="w-full py-2.5 border border-dashed border-red-300 rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Nuovo da Assegnare</span>
                  </button>
                </div>
              </div>

              {/* COLONNE AUTISTI PER IL GIORNO SELEZIONATO (DROP TARGET PER ASSEGNARE AD AUTISTA) */}
              {initialDrivers.map((driver: any) => {
                const driverTrips = currentDayTrips
                  .filter((t: any) => t.driverId === driver.id)
                  .sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
                
                const avatar = getDriverAvatar(driver.name, driver.profilePicture);
                const isOverThisDriver = dragOverTarget === `driver-${driver.id}`;

                return (
                  <div 
                    key={driver.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverTarget(`driver-${driver.id}`);
                    }}
                    onDragLeave={() => {
                      if (isOverThisDriver) setDragOverTarget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const raw = e.dataTransfer.getData('text/plain');
                      if (!raw) return;
                      const data = JSON.parse(raw);
                      handleMoveTrip(data.tripId, driver.id, selectedDayDateStr);
                      setDragOverTarget(null);
                    }}
                    className={cn(
                      "w-80 xl:w-84 flex-shrink-0 flex flex-col h-full transition-colors relative",
                      isOverThisDriver ? "bg-red-50/70 ring-2 ring-inset ring-[var(--color-brand-red)]" : "bg-[var(--color-saggin-bg)]/40"
                    )}
                  >
                    {/* Header Autista */}
                    <div className="p-3.5 border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] sticky top-0 z-10 flex items-center gap-2.5 shadow-2xs">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={driver.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-saggin-border)] shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center text-xs font-bold font-space text-[var(--color-saggin-text-primary)] shrink-0">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold font-space text-sm text-[var(--color-saggin-text-primary)] truncate">
                          {driver.name}
                        </h3>
                        <p className="text-[11px] text-[var(--color-saggin-text-secondary)] flex items-center gap-1 mt-0.5 truncate font-medium">
                          <Truck className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{driver.defaultVehicle?.name || 'Senza mezzo fisso'}</span>
                        </p>
                      </div>

                      <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-secondary)] border border-[var(--color-saggin-border)]">
                        {driverTrips.length}
                      </span>
                    </div>

                    {/* Drop overlay helper quando si trascina */}
                    {isOverThisDriver && (
                      <div className="p-2 bg-red-100 text-[var(--color-brand-red)] text-xs font-bold text-center border-b border-red-200 animate-pulse">
                        Rilascia per assegnare a {driver.name.split(' ')[0]}
                      </div>
                    )}

                    {/* Lista Viaggi Autista */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {driverTrips.length === 0 ? (
                        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium bg-white/40">
                          Nessun viaggio programmato per oggi
                          <br /><span className="text-[11px] text-slate-400">Trascina un viaggio qui per assegnarlo</span>
                        </div>
                      ) : (
                        driverTrips.map((trip: any) => {
                          const isCompleted = trip.status === 'COMPLETATO';
                          const isInProgress = trip.status === 'IN_CORSO';

                          return (
                            <div 
                              key={trip.id}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', JSON.stringify({ tripId: trip.id, sourceDriverId: driver.id }));
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedTripId(trip.id);
                              }}
                              onDragEnd={() => {
                                setDraggedTripId(null);
                                setDragOverTarget(null);
                              }}
                              onClick={() => handleTripClick(trip.id)}
                              className={cn(
                                "bg-white border p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:border-[var(--color-brand-red)] shadow-2xs hover:shadow-xs relative overflow-hidden group select-none",
                                isInProgress ? "border-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/30 bg-amber-50/10" :
                                isCompleted ? "border-emerald-200 bg-emerald-50/10" :
                                "border-[var(--color-saggin-border)]",
                                draggedTripId === trip.id && "opacity-40 ring-2 ring-[var(--color-brand-red)] scale-95"
                              )}
                            >
                              {/* Striscia di stato colorata */}
                              <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                isInProgress ? "bg-[var(--color-warning)]" :
                                isCompleted ? "bg-[var(--color-success)]" :
                                "bg-slate-400"
                              )} />
                              
                              {/* Riga Superiore: Orario & Badge Stato */}
                              <div className="flex justify-between items-center mb-1.5 pl-1.5">
                                <div className="flex items-center gap-1.5">
                                  <GripVertical size={13} className="text-slate-300 opacity-60 group-hover:opacity-100" />
                                  <span className="font-bold font-space text-sm text-[var(--color-saggin-text-primary)]">
                                    {trip.scheduledTime || 'Orario N/D'}
                                  </span>
                                </div>
                                <StatusBadge status={trip.status} size="sm" />
                              </div>
                              
                              {/* Cliente & Merce */}
                              <div className="pl-1.5 space-y-1">
                                {trip.clientName ? (
                                  <>
                                    <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-1">
                                      {trip.clientName}
                                    </div>
                                    <div className="text-[11px] font-medium text-[var(--color-saggin-text-secondary)] line-clamp-1">
                                      {trip.cargoDescription}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-2">
                                    {trip.cargoDescription}
                                  </div>
                                )}

                                <div className="flex items-start gap-1 text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                                  <span className="truncate">{trip.address}</span>
                                </div>
                              </div>
                              
                              {/* Mezzo & Gru */}
                              <div className="mt-2.5 pt-2 border-t border-[var(--color-saggin-border)]/70 flex items-center justify-between text-[11px] pl-1.5">
                                <div className="flex items-center gap-1 text-slate-600 font-medium truncate mr-1">
                                  <Truck size={12} className="shrink-0 text-slate-400" />
                                  <span className="truncate">{trip.vehicle?.name || 'Nessun mezzo'}</span>
                                </div>

                                {trip.needsCrane && (
                                  <span className="bg-red-50 text-[var(--color-brand-red)] font-bold px-1.5 py-0.5 rounded text-[9px] border border-red-200 shrink-0">
                                    GRU
                                  </span>
                                )}
                              </div>

                              {/* Creato da */}
                              <div className="mt-1.5 pt-1.5 border-t border-[var(--color-saggin-border)]/50 flex items-center justify-between text-[10px] pl-1.5 text-slate-500">
                                <div className="flex items-center gap-1">
                                  <User size={11} className="text-[var(--color-brand-red)]" />
                                  <span>Creato da:</span>
                                  <strong className="text-[var(--color-saggin-text-primary)]">
                                    {trip.createdByName || trip.auditLogs?.find((a: any) => a.action === 'CREATE')?.officeUser?.name || 'Ufficio'}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Tasto Aggiungi Viaggio per questo autista */}
                      <button 
                        onClick={() => handleAddTrip(driver.id, selectedDayDateStr)}
                        className="w-full py-2.5 border border-dashed border-[var(--color-saggin-border)] rounded-xl text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-brand-red)] hover:border-red-300 hover:bg-red-50/40 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Aggiungi per {driver.name.split(' ')[0]}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENUTO PLANNING: VISTA GRIGLIA SETTIMANALE (MATRICE COMPLETA CON DRAG & DROP) */}
      {viewMode === 'matrix' && (
        <div className="flex-1 min-h-0 overflow-auto bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] shadow-xs">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-saggin-text-secondary)] py-20">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-[var(--color-brand-red)]" />
              <p className="font-semibold text-sm">Caricamento matrice settimanale...</p>
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] sticky top-0 z-20">
                  <th className="text-left p-3.5 text-xs font-bold text-[var(--color-saggin-text-primary)] font-space uppercase tracking-wider w-56 border-r border-[var(--color-saggin-border)] sticky left-0 bg-[var(--color-saggin-elevated)] z-30">
                    Autista / Mezzo
                  </th>
                  {WEEK_DAYS.map((day, idx) => {
                    const dayDate = weekDates[idx];
                    const isToday = formatLocalDateStr(dayDate) === todayStr;
                    const totalDayTrips = tripsCountByDay[day.id] || 0;

                    return (
                      <th 
                        key={day.id} 
                        className={cn(
                          "p-3 text-center border-r border-[var(--color-saggin-border)] last:border-r-0 min-w-[150px]",
                          isToday && "bg-red-50/50"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-space text-xs text-[var(--color-saggin-text-primary)]">
                              {day.name}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[var(--color-brand-red)] text-white">
                                Oggi
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-saggin-text-secondary)]">
                            <span>{dayDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                            <span>•</span>
                            <span className={cn(
                              "px-1.5 py-0.2 rounded font-bold",
                              totalDayTrips > 0 ? "bg-slate-200 text-slate-800" : "text-slate-400"
                            )}>
                              {totalDayTrips}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-saggin-border)]">
                {initialDrivers.map((driver: any) => {
                  const avatar = getDriverAvatar(driver.name, driver.profilePicture);

                  return (
                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Cella Info Autista */}
                      <td className="p-3.5 border-r border-[var(--color-saggin-border)] sticky left-0 bg-[var(--color-saggin-surface)] z-10 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          {avatar ? (
                            <img 
                              src={avatar} 
                              alt={driver.name} 
                              className="w-9 h-9 rounded-full object-cover border border-[var(--color-saggin-border)] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center text-xs font-bold font-space text-[var(--color-saggin-text-primary)] shrink-0">
                              {driver.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold font-space text-xs text-[var(--color-saggin-text-primary)] truncate">
                              {driver.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Truck size={10} className="text-slate-400 shrink-0" />
                              <span>{driver.defaultVehicle?.name || 'Nessun mezzo'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 7 Celle dei Giorni con Drag and Drop */}
                      {WEEK_DAYS.map((day, idx) => {
                        const cellDate = weekDates[idx];
                        const cellDateStr = formatLocalDateStr(cellDate);
                        const isToday = cellDateStr === todayStr;
                        const cellTrips = trips
                          .filter(t => t.driverId === driver.id && formatLocalDateStr(t.date) === cellDateStr)
                          .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

                        const cellTargetKey = `cell-${driver.id}-${cellDateStr}`;
                        const isOverThisCell = dragOverTarget === cellTargetKey;

                        return (
                          <td 
                            key={day.id} 
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setDragOverTarget(cellTargetKey);
                            }}
                            onDragLeave={() => {
                              if (isOverThisCell) setDragOverTarget(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const raw = e.dataTransfer.getData('text/plain');
                              if (!raw) return;
                              const data = JSON.parse(raw);
                              handleMoveTrip(data.tripId, driver.id, cellDateStr);
                              setDragOverTarget(null);
                            }}
                            className={cn(
                              "p-2 border-r border-[var(--color-saggin-border)] last:border-r-0 align-top transition-colors group/cell relative",
                              isToday && "bg-red-50/20",
                              isOverThisCell && "bg-red-100/60 ring-2 ring-inset ring-[var(--color-brand-red)]"
                            )}
                          >
                            <div className="space-y-1.5 min-h-[75px] flex flex-col justify-between">
                              <div className="space-y-1.5">
                                {cellTrips.map(trip => {
                                  const isDone = trip.status === 'COMPLETATO';
                                  const isWorking = trip.status === 'IN_CORSO';

                                  return (
                                    <div
                                      key={trip.id}
                                      draggable={true}
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', JSON.stringify({ tripId: trip.id, sourceDriverId: driver.id, sourceDate: cellDateStr }));
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggedTripId(trip.id);
                                      }}
                                      onDragEnd={() => {
                                        setDraggedTripId(null);
                                        setDragOverTarget(null);
                                      }}
                                      onClick={() => handleTripClick(trip.id)}
                                      className={cn(
                                        "p-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all hover:shadow-xs select-none",
                                        isWorking ? "bg-amber-50 border-amber-300 text-amber-900" :
                                        isDone ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" :
                                        "bg-white border-slate-200 hover:border-[var(--color-brand-red)] text-slate-800",
                                        draggedTripId === trip.id && "opacity-40 ring-2 ring-[var(--color-brand-red)] scale-95"
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <div className="flex items-center gap-1">
                                          <GripVertical size={11} className="text-slate-400" />
                                          <span className="font-bold font-mono text-[11px]">
                                            {trip.scheduledTime || '--:--'}
                                          </span>
                                        </div>
                                        {trip.needsCrane && (
                                          <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-red-100 text-[var(--color-brand-red)]">
                                            GRU
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-semibold text-[11px] line-clamp-1 leading-tight">
                                        {trip.clientName || trip.cargoDescription}
                                      </div>
                                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                        {trip.address}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Tasto rapido aggiunta in cella */}
                              <button
                                onClick={() => handleAddTrip(driver.id, cellDateStr)}
                                className="w-full py-1 opacity-0 group-hover/cell:opacity-100 transition-opacity border border-dashed border-slate-300 hover:border-[var(--color-brand-red)] hover:bg-red-50 text-[10px] font-semibold text-slate-500 hover:text-[var(--color-brand-red)] rounded-md flex items-center justify-center gap-1 mt-1"
                              >
                                <Plus size={11} />
                                <span>Aggiungi</span>
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL NUOVO / MODIFICA VIAGGIO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-[var(--color-saggin-surface)] rounded-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col overflow-hidden border border-[var(--color-saggin-border)] shadow-2xl">
            
            {/* Header Finestra Modale con Tasto X ad Alto Contrasto */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-saggin-border)] shrink-0 bg-[var(--color-saggin-surface)]">
              <div>
                <h2 className="text-xl font-bold font-space text-[var(--color-saggin-text-primary)]">
                  {selectedTripId ? 'Modifica Viaggio' : 'Nuovo Viaggio'}
                </h2>
                <p className="text-xs text-[var(--color-saggin-text-secondary)] mt-0.5">
                  Assegnazione trasporti, dati autista e controllo tecnico del carico
                </p>
              </div>

              {/* Pulsante Chiusura X ad Alto Contrasto */}
              <button 
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-[var(--color-saggin-elevated)] hover:bg-slate-200 text-[var(--color-saggin-text-primary)] flex items-center justify-center border border-[var(--color-saggin-border)] transition-colors shadow-2xs"
                title="Chiudi finestra"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <TripForm 
                trip={selectedTripForModal}
                drivers={initialDrivers}
                vehicles={initialVehicles}
                onSave={handleSave}
                onCancel={closeModal}
                defaultDriverId={selectedDriverForNewTrip}
                defaultDate={selectedDateForNewTrip || selectedDayDateStr}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
