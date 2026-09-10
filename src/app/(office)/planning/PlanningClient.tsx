'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Truck,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export default function PlanningClient({ initialDrivers, initialTrips, initialVehicles }: any) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Compute start of current week (Monday)
    const startOfWeek = new Date(currentDate);
    const dow = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - dow + 1);
    const weekStart = startOfWeek.toISOString().split('T')[0];

    fetch(`/api/trips?weekStart=${weekStart}`)
      .then(res => res.json())
      .then(data => {
        const allTrips = data.success && Array.isArray(data.data) ? data.data : [];
        // Compute the date for selectedDay within currentDate week
        const target = new Date(startOfWeek);
        target.setDate(startOfWeek.getDate() + selectedDay - 1);
        const targetStr = target.toISOString().split('T')[0];
        setTrips(allTrips.filter((t: any) => t.date && t.date.startsWith(targetStr)));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [currentDate, selectedDay]);

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const setToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDay() || 7);
  };

  const getWeekString = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() || 7) + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `Lun ${startOfWeek.toLocaleDateString('it-IT', options)} - Dom ${endOfWeek.toLocaleDateString('it-IT', options)} ${endOfWeek.getFullYear()}`;
  };

  const handleTripClick = (tripId: string) => {
    setSelectedTripId(tripId);
    setSelectedDriverId(null);
    setShowModal(true);
  };

  const handleAddTrip = (driverId: string) => {
    setSelectedDriverId(driverId);
    setSelectedTripId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTripId(null);
    setSelectedDriverId(null);
  };

  const handleSave = async (formData: any) => {
    try {
      const url = selectedTripId ? `/api/trips/${selectedTripId}` : '/api/trips';
      const method = selectedTripId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || 'Errore durante il salvataggio'); }
      
      router.refresh();
      closeModal();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Errore durante il salvataggio del viaggio');
    }
  };

  const getFormattedCurrentDateString = () => {
    const selectedDateStr = new Date(currentDate);
    const dayDiff = selectedDay - (currentDate.getDay() || 7);
    selectedDateStr.setDate(currentDate.getDate() + dayDiff);
    return selectedDateStr.toISOString().split('T')[0];
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 md:p-6 bg-[var(--color-saggin-surface)] p-5 md:p-6 rounded-xl  border border-[var(--color-saggin-border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--color-brand-red)]/10 rounded-xl">
            <Calendar className="h-6 w-6 text-[var(--color-brand-red)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-saggin-text-primary)]">Planning Settimanale</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--color-saggin-surface)] p-1.5 rounded-xl border border-[var(--color-saggin-border)]">
          <button 
            onClick={() => changeWeek('prev')}
            className="p-1.5 hover:bg-[var(--color-saggin-bg)] rounded  text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="font-medium text-sm px-2 w-52 text-center text-[var(--color-saggin-text-secondary)]">
            {getWeekString()}
          </span>
          
          <button 
            onClick={() => changeWeek('next')}
            className="p-1.5 hover:bg-[var(--color-saggin-bg)] rounded  text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <div className="w-px h-6 bg-[var(--color-saggin-bg)] mx-1"></div>
          
          <button 
            onClick={setToday}
            className="px-3 py-1.5 text-sm font-medium text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red)]/10 rounded transition-colors"
          >
            Oggi
          </button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
        {WEEK_DAYS.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all  border",
              selectedDay === day.id
                ? "bg-[var(--color-brand-red)] text-white border-[var(--color-brand-red)] "
                : "bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)] hover:border-[var(--color-saggin-border)] hover:bg-[var(--color-saggin-bg)]"
            )}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[var(--color-saggin-surface)] rounded-xl  border border-[var(--color-saggin-border)] relative">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--color-saggin-text-secondary)]">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-[var(--color-brand-red)]" />
            <p className="font-medium">Caricamento planning...</p>
          </div>
        ) : (
          <div className="h-full flex min-w-max">
            {initialDrivers.map((driver: any) => {
              const driverTrips = trips
                .filter((t: any) => t.driverId === driver.id)
                .sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

              return (
                <div key={driver.id} className="w-80 flex-shrink-0 border-r border-[var(--color-saggin-border)] flex flex-col h-full bg-[var(--color-saggin-surface)]/50">
                  <div className="p-5 md:p-6 border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] sticky top-0 z-10 ">
                    <h3 className="font-semibold text-[var(--color-saggin-text-primary)] truncate">{driver.name}</h3>
                    <p className="text-xs text-[var(--color-saggin-text-secondary)] flex items-center gap-1 mt-1">
                      <Truck className="h-3 w-3" />
                      {driver.defaultVehicle?.name || 'Nessun mezzo'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 relative group">
                    {driverTrips.map((trip: any) => (
                      <div 
                        key={trip.id}
                        onClick={() => handleTripClick(trip.id)}
                        className="bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] hover:border-[var(--color-brand-red)] p-3 rounded-xl  cursor-pointer transition-all hover:-translate-y-0.5 relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                        
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="font-semibold text-[var(--color-brand-red)]">{trip.scheduledTime}</span>
                          <StatusBadge status={trip.status} size="sm" />
                        </div>
                        
                        <div className="pl-2">
                          <div className="text-sm font-medium text-[var(--color-saggin-text-primary)] mb-1 leading-tight">{trip.cargoDescription}</div>
                          <div className="text-xs text-[var(--color-saggin-text-secondary)] line-clamp-2">{trip.address}</div>
                        </div>
                        
                        {trip.needsCrane && (
                          <div className="mt-3 pl-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-saggin-text-primary)]">
                            <span className="bg-[var(--color-brand-red)] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> GRU
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      onClick={() => handleAddTrip(driver.id)}
                      className="w-full mt-2 py-3 border-2 border-dashed border-[var(--color-saggin-border)] rounded-xl text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-brand-red)] hover:border-[var(--color-brand-red)]/50 hover:bg-[var(--color-brand-red)]/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Aggiungi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 md:p-6 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-[var(--color-saggin-surface)] rounded-2xl  w-full max-w-5xl h-full sm:h-[90vh] flex flex-col overflow-hidden border border-[var(--color-saggin-border)]">
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-[var(--color-saggin-border)] shrink-0">
              <h2 className="text-xl font-semibold text-[var(--color-saggin-text-primary)]">
                {selectedTripId ? 'Modifica Viaggio' : 'Nuovo Viaggio'}
              </h2>
              <button onClick={closeModal} className="p-2 text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] rounded-xl hover:bg-[var(--color-saggin-bg)] transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <TripForm 
                trip={selectedTripId ? initialTrips.find((t:any) => t.id === selectedTripId) : null}
                drivers={initialDrivers}
                vehicles={initialVehicles}
                onSave={handleSave}
                onCancel={closeModal}
                defaultDriverId={selectedDriverId}
                defaultDate={getFormattedCurrentDateString()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
