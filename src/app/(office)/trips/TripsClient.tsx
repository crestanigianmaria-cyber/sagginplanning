'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Filter, 
  Plus, 
  Search,
  Route as RouteIcon
} from 'lucide-react';
import TripForm from '@/components/trips/TripForm';
import StatusBadge from '@/components/shared/StatusBadge';

export default function TripsClient({ initialTrips, drivers, vehicles }: any) {
  const router = useRouter();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [trips, setTrips] = useState(initialTrips);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with server after refresh
  useEffect(() => { setTrips(initialTrips); }, [initialTrips]);
  
  const filteredTrips = trips.filter((t: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.address?.toLowerCase().includes(q) || t.cargoDescription?.toLowerCase().includes(q) || t.driver?.name?.toLowerCase().includes(q);
  });

  const handleSelectTrip = (id: string) => {
    setSelectedTripId(id);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedTripId(null);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setSelectedTripId(null);
    setIsCreating(false);
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
      handleCancel();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Errore durante il salvataggio del viaggio');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 md:p-6 mb-6 bg-white p-5 md:p-6 rounded-xl  border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-900/10 rounded-xl">
            <RouteIcon className="h-6 w-6 text-rose-900" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestione Viaggi</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cerca viaggio..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 focus:border-rose-900"
            />
          </div>
          <button className="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-rose-900 text-white text-sm font-medium rounded-xl hover:bg-rose-950 transition-colors "
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Viaggio</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl  border border-slate-200 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-200 bg-white">
            <h2 className="font-semibold text-slate-700">Elenco Viaggi</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredTrips.length === 0 && (
              <div className="text-center p-5 md:p-6 text-slate-500">Nessun viaggio trovato</div>
            )}
            {filteredTrips.map((trip: any) => (
              <div 
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className={`p-5 md:p-6 rounded-xl border cursor-pointer transition-all ${
                  selectedTripId === trip.id 
                    ? 'border-rose-900 bg-slate-50/50 ' 
                    : 'border-slate-200 hover:border-zinc-600 hover: bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-rose-900">{new Date(trip.date).toLocaleDateString()} - {trip.scheduledTime}</span>
                  <StatusBadge status={trip.status} size="sm" />
                </div>
                <div className="text-sm font-medium text-slate-900 mb-1">{trip.address}</div>
                <div className="text-xs text-slate-500">{trip.driver?.name}</div>
                {trip.auditLogs?.find((l: any) => l.action === 'CREATE')?.officeUser?.name && (
                  <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-200 pt-1">
                    Creato da: <span className="font-medium text-slate-500">{trip.auditLogs.find((l: any) => l.action === 'CREATE').officeUser.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col w-2/3 bg-white rounded-xl  border border-slate-200 overflow-hidden">
          {isCreating || selectedTripId ? (
            <div className="flex-1 overflow-y-auto">
              <TripForm 
                trip={trips.find((t: any) => t.id === selectedTripId)}
                onCancel={handleCancel}
                onSave={handleSave}
                drivers={drivers} 
                vehicles={vehicles}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <RouteIcon className="h-16 w-16 text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-2">Nessun viaggio selezionato</h3>
              <p className="text-sm max-w-sm">
                Seleziona un viaggio dalla lista a sinistra per vederne i dettagli o creane uno nuovo per iniziare.
              </p>
              <button 
                onClick={handleCreateNew}
                className="mt-6 px-6 py-2 bg-rose-900 text-white text-sm font-medium rounded-xl hover:bg-rose-950 transition-colors"
              >
                Crea Nuovo Viaggio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
