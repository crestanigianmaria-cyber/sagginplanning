'use client';

import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { cn, getDriverAvatar } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import TripForm from '@/components/trips/TripForm';

const WEEK_DAYS = [
  { id: 1, name: 'Lunedì' },
  { id: 2, name: 'Martedì' },
  { id: 3, name: 'Mercoledì' },
  { id: 4, name: 'Giovedì' },
  { id: 5, name: 'Venerdì' },
  { id: 6, name: 'Sabato' },
  { id: 7, name: 'Domenica' }
];

export default function PlanningClient({ 
  initialDrivers, 
  initialVehicles, 
  initialTrips 
}: any) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 7);
  const [trips, setTrips] = useState<any[]>(initialTrips || []);
  const [unassignedTrips, setUnassignedTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDriverForNewTrip, setSelectedDriverForNewTrip] = useState<string | undefined>(undefined);

  const fetchUnassignedTrips = async () => {
    try {
      // I viaggi da assegnare vengono recuperati SEMPRE, indipendentemente dalla data o settimana!
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
    fetchTrips();
    fetchUnassignedTrips();
  }, [currentDate, selectedDay]);

  const getWeekDates = (date: Date) => {
    const day = date.getDay() || 7;
    const diff = date.getDate() - day + 1;
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const targetDate = weekDates[selectedDay - 1];
      const dateStr = targetDate.toISOString().split('T')[0];
      const res = await fetch(`/api/trips?date=${dateStr}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.data);
      }
    } catch (e) {
      console.error('Error fetching trips:', e);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddTrip = (driverId?: string) => {
    setSelectedTripId(null);
    setSelectedDriverForNewTrip(driverId);
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
        fetchTrips();
        fetchUnassignedTrips();
      } else {
        alert(data.error || 'Errore durante il salvataggio');
      }
    } catch (e: any) {
      alert(e.message || 'Errore durante il salvataggio del viaggio');
    }
  };

  const getFormattedCurrentDateString = () => {
    const targetDate = weekDates[selectedDay - 1];
    return targetDate.toISOString().split('T')[0];
  };



  return (
    <div className="h-full flex flex-col space-y-3 font-sans relative min-h-0">
      
      {/* UNIFIED COMPACT PLANNING CONTROL BAR */}
      <div className="bg-[var(--color-saggin-surface)] px-4 py-2.5 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Title & Quick Add */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-lg border border-red-200">
              <Calendar className="h-4.5 w-4.5 text-[var(--color-brand-red)]" />
            </div>
            <div>
              <h1 className="text-base font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">Planning Trasporti</h1>
              <p className="text-[10px] text-[var(--color-saggin-text-secondary)] font-medium">Gestione corse e flotta</p>
            </div>
          </div>

          <button 
            onClick={() => handleAddTrip(undefined)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Nuovo Viaggio</span>
          </button>
        </div>
        
        {/* Center: Week Navigator */}
        <div className="flex items-center gap-1 bg-[var(--color-saggin-elevated)] p-1 rounded-xl border border-[var(--color-saggin-border)] self-start md:self-center">
          <button 
            onClick={() => changeWeek('prev')}
            className="p-1.5 hover:bg-white rounded-lg text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all shadow-2xs"
            title="Settimana precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="font-bold font-space text-xs px-2.5 min-w-[165px] text-center text-[var(--color-saggin-text-primary)]">
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
            className="px-2.5 py-1 text-xs font-bold text-[var(--color-brand-red)] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            Oggi
          </button>
        </div>

        {/* Right: Day Selector (Lun - Dom) as compact segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 md:pb-0">
          {WEEK_DAYS.map((day, idx) => {
            const isSelected = selectedDay === day.id;
            const dayDate = weekDates[idx];
            const isCurrentToday = new Date().toDateString() === dayDate.toDateString();

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5",
                  isSelected
                    ? "bg-[var(--color-brand-red)] text-white border-[var(--color-brand-red)] shadow-2xs font-bold"
                    : "bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)] hover:border-slate-400 hover:text-[var(--color-saggin-text-primary)]"
                )}
              >
                <span>{day.name.slice(0, 3)}</span>
                <span className={cn(
                  "font-mono text-[10px] px-1 py-0.2 rounded font-bold",
                  isSelected ? "bg-white/20 text-white" : "bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-secondary)]"
                )}>
                  {dayDate.getDate()}
                </span>
                {isCurrentToday && (
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-[var(--color-brand-red)]"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PLANNING COLUMNS CONTAINER (FULL HEIGHT, CLEAN HORIZONTAL SCROLL) */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] relative shadow-xs">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--color-saggin-text-secondary)]">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-[var(--color-brand-red)]" />
            <p className="font-semibold text-sm">Caricamento planning...</p>
          </div>
        ) : (
          <div className="h-full flex min-w-max divide-x divide-[var(--color-saggin-border)]">
            
            {/* COLONNA: VIAGGI DA ASSEGNARE */}
            <div className="w-76 xl:w-80 flex-shrink-0 flex flex-col h-full bg-red-50/20">
              <div className="p-3.5 border-b border-red-200/80 bg-red-50/60 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-[var(--color-brand-red)] text-white flex items-center justify-center shadow-2xs">
                    <AlertCircle size={15} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs font-space text-[var(--color-brand-red)] uppercase tracking-wider">
                      Da Assegnare
                    </h3>
                    <p className="text-[10px] text-red-600 font-medium">In attesa di autista</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-[var(--color-brand-red)] border border-red-200">
                  {unassignedTrips.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {unassignedTrips.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-red-200 rounded-xl text-xs text-red-500 font-medium">
                    Tutti i viaggi hanno un autista assegnato
                  </div>
                ) : (
                  unassignedTrips.map((trip: any) => (
                    <div 
                      key={trip.id}
                      onClick={() => handleTripClick(trip.id)}
                      className="bg-white border border-red-200 hover:border-[var(--color-brand-red)] p-3 rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-xs relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[var(--color-brand-red)]" />
                      
                      <div className="flex justify-between items-center mb-1.5 pl-1.5">
                        <div className="flex items-center gap-1.5 text-[var(--color-brand-red)] font-bold font-space text-sm">
                          <Clock size={13} />
                          <span>{trip.scheduledTime}</span>
                        </div>
                        {trip.date && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100/80 text-[var(--color-brand-red)] border border-red-200 font-mono">
                            📅 {new Date(trip.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>

                      <div className="pl-1.5 space-y-1">
                        <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-1">
                          {trip.clientName || trip.contactName || trip.cargoDescription}
                        </div>
                        <div className="text-[11px] text-[var(--color-saggin-text-secondary)] font-medium line-clamp-1">
                          {trip.cargoDescription}
                        </div>
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

                      {/* Tasto Diretto Assegnazione */}
                      <div className="mt-2 pt-2 border-t border-dashed border-red-200">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTripClick(trip.id);
                          }}
                          className="w-full py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <span>Assegna Autista &rarr;</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button 
                  onClick={() => handleAddTrip(undefined)}
                  className="w-full py-2.5 border border-dashed border-red-300 rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Nuovo da Assegnare</span>
                </button>
              </div>
            </div>

            {/* COLONNE AUTISTI */}
            {initialDrivers.map((driver: any) => {
              const driverTrips = trips
                .filter((t: any) => t.driverId === driver.id)
                .sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
              
              const avatar = getDriverAvatar(driver.name, driver.profilePicture);

              return (
                <div key={driver.id} className="w-76 xl:w-80 flex-shrink-0 flex flex-col h-full bg-[var(--color-saggin-bg)]/40">
                  {/* Driver Column Header */}
                  <div className="p-3.5 border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] sticky top-0 z-10 flex items-center gap-2.5 shadow-2xs">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={driver.name} 
                        className="w-9 h-9 rounded-full object-cover border-2 border-[var(--color-saggin-border)] shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center text-xs font-bold font-space text-[var(--color-saggin-text-primary)] shrink-0">
                        {driver.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold font-space text-sm text-[var(--color-saggin-text-primary)] truncate">{driver.name}</h3>
                      <p className="text-[11px] text-[var(--color-saggin-text-secondary)] flex items-center gap-1 mt-0.2 truncate font-medium">
                        <Truck className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{driver.defaultVehicle?.name || 'Senza mezzo fisso'}</span>
                      </p>
                    </div>

                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-secondary)] border border-[var(--color-saggin-border)]">
                      {driverTrips.length}
                    </span>
                  </div>

                  {/* Driver Trips Cards */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {driverTrips.map((trip: any) => {
                      const isCompleted = trip.status === 'COMPLETATO';
                      const isInProgress = trip.status === 'IN_CORSO';

                      return (
                        <div 
                          key={trip.id}
                          onClick={() => handleTripClick(trip.id)}
                          className={cn(
                            "bg-white border p-3 rounded-xl cursor-pointer transition-all hover:border-[var(--color-brand-red)] shadow-2xs hover:shadow-xs relative overflow-hidden",
                            isInProgress ? "border-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/30 bg-amber-50/10" :
                            isCompleted ? "border-emerald-200 bg-emerald-50/10" :
                            "border-[var(--color-saggin-border)]"
                          )}
                        >
                          {/* Colored Status Strip */}
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            isInProgress ? "bg-[var(--color-warning)]" :
                            isCompleted ? "bg-[var(--color-success)]" :
                            "bg-slate-400"
                          )} />
                          
                          {/* Top Row: Time & Status Badge */}
                          <div className="flex justify-between items-center mb-1 pl-1.5">
                            <span className="font-bold font-space text-sm text-[var(--color-saggin-text-primary)]">
                              {trip.scheduledTime}
                            </span>
                            <StatusBadge status={trip.status} size="sm" />
                          </div>
                          
                          {/* Cargo & Destination */}
                          <div className="pl-1.5 space-y-1">
                            <div className="text-xs font-bold text-[var(--color-saggin-text-primary)] leading-tight line-clamp-1">
                              {trip.clientName || trip.contactName || trip.cargoDescription}
                            </div>
                            <div className="text-[11px] font-medium text-[var(--color-saggin-text-secondary)] line-clamp-1">
                              {trip.cargoDescription}
                            </div>
                            <div className="flex items-start gap-1 text-[11px] text-slate-500 line-clamp-1">
                              <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                              <span className="truncate">{trip.address}</span>
                            </div>
                          </div>
                          
                          {/* Bottom Row: Assigned Vehicle & Crane */}
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

                          {/* Chi ha creato il viaggio */}
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
                    })}

                    {/* Add Trip for Driver */}
                    <button 
                      onClick={() => handleAddTrip(driver.id)}
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

      {/* MODAL NUOVO / MODIFICA VIAGGIO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-[var(--color-saggin-surface)] rounded-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col overflow-hidden border border-[var(--color-saggin-border)] shadow-2xl">
            
            {/* Modal Header with High-Contrast Clear Close Button (X) */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-saggin-border)] shrink-0 bg-[var(--color-saggin-surface)]">
              <div>
                <h2 className="text-xl font-bold font-space text-[var(--color-saggin-text-primary)]">
                  {selectedTripId ? 'Modifica Viaggio' : 'Nuovo Viaggio'}
                </h2>
                <p className="text-xs text-[var(--color-saggin-text-secondary)] mt-0.5">
                  Assegnazione trasporti e controllo tecnico carico
                </p>
              </div>

              {/* High-Contrast Visible X Button */}
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
                trip={selectedTripId ? trips.find((t:any) => t.id === selectedTripId) : null}
                drivers={initialDrivers}
                vehicles={initialVehicles}
                onSave={handleSave}
                onCancel={closeModal}
                defaultDriverId={selectedDriverForNewTrip}
                defaultDate={getFormattedCurrentDateString()}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
