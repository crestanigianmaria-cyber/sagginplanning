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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#dc2626]/10 rounded-lg">
            <Calendar className="h-6 w-6 text-[#dc2626]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Planning Settimanale</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-gray-200">
          <button 
            onClick={() => changeWeek('prev')}
            className="p-1.5 hover:bg-gray-100 rounded shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="font-medium text-sm px-2 w-52 text-center text-gray-700">
            {getWeekString()}
          </span>
          
          <button 
            onClick={() => changeWeek('next')}
            className="p-1.5 hover:bg-gray-100 rounded shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-100 mx-1"></div>
          
          <button 
            onClick={setToday}
            className="px-3 py-1.5 text-sm font-medium text-[#dc2626] hover:bg-[#dc2626]/10 rounded transition-colors"
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
              "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm border",
              selectedDay === day.id
                ? "bg-[#dc2626] text-gray-900 border-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
            )}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white rounded-xl shadow-sm border border-gray-200 relative">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#dc2626]" />
            <p className="font-medium">Caricamento planning...</p>
          </div>
        ) : (
          <div className="h-full flex min-w-max">
            {initialDrivers.map((driver: any) => {
              const driverTrips = trips
                .filter((t: any) => t.driverId === driver.id)
                .sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

              return (
                <div key={driver.id} className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col h-full bg-white/50">
                  <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                    <h3 className="font-bold text-gray-900 truncate">{driver.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Truck className="h-3 w-3" />
                      {driver.defaultVehicle?.name || 'Nessun mezzo'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 relative group">
                    {driverTrips.map((trip: any) => (
                      <div 
                        key={trip.id}
                        onClick={() => handleTripClick(trip.id)}
                        className="bg-white border border-gray-300 hover:border-[#dc2626] p-3 rounded-lg shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                        
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="font-bold text-[#dc2626]">{trip.scheduledTime}</span>
                          <StatusBadge status={trip.status} size="sm" />
                        </div>
                        
                        <div className="pl-2">
                          <div className="text-sm font-medium text-gray-900 mb-1 leading-tight">{trip.cargoDescription}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">{trip.address}</div>
                        </div>
                        
                        {trip.needsCrane && (
                          <div className="mt-3 pl-2 flex items-center gap-1 text-[10px] font-bold text-gray-900">
                            <span className="bg-[#dc2626] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> GRU
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      onClick={() => handleAddTrip(driver.id)}
                      className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-[#dc2626] hover:border-[#dc2626]/50 hover:bg-[#dc2626]/5 transition-all flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col overflow-hidden border border-gray-300">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedTripId ? 'Modifica Viaggio' : 'Nuovo Viaggio'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
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
