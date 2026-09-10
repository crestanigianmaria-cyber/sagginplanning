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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#111113] p-4 rounded-xl shadow-sm border border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#dc2626]/10 rounded-lg">
            <RouteIcon className="h-6 w-6 text-[#dc2626]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gestione Viaggi</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cerca viaggio..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#09090b] border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626]"
            />
          </div>
          <button className="p-2 text-zinc-500 bg-[#09090b] border border-zinc-700 rounded-lg hover:bg-zinc-800">
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Viaggio</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col bg-[#111113] rounded-xl shadow-sm border border-zinc-700 overflow-hidden">
          <div className="p-4 border-b border-zinc-700 bg-[#09090b]">
            <h2 className="font-semibold text-zinc-300">Elenco Viaggi</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredTrips.length === 0 && (
              <div className="text-center p-4 text-zinc-500">Nessun viaggio trovato</div>
            )}
            {filteredTrips.map((trip: any) => (
              <div 
                key={trip.id}
                onClick={() => handleSelectTrip(trip.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedTripId === trip.id 
                    ? 'border-[#dc2626] bg-zinc-800/50 shadow-sm' 
                    : 'border-zinc-700 hover:border-zinc-600 hover:shadow-sm bg-[#111113]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-[#dc2626]">{new Date(trip.date).toLocaleDateString()} - {trip.scheduledTime}</span>
                  <StatusBadge status={trip.status} size="sm" />
                </div>
                <div className="text-sm font-medium text-white mb-1">{trip.address}</div>
                <div className="text-xs text-zinc-500">{trip.driver?.name}</div>
                {trip.auditLogs?.find((l: any) => l.action === 'CREATE')?.officeUser?.name && (
                  <div className="text-[10px] text-zinc-600 mt-2 border-t border-zinc-800 pt-1">
                    Creato da: <span className="font-medium text-zinc-400">{trip.auditLogs.find((l: any) => l.action === 'CREATE').officeUser.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col w-2/3 bg-[#111113] rounded-xl shadow-sm border border-zinc-700 overflow-hidden">
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
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <RouteIcon className="h-16 w-16 text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">Nessun viaggio selezionato</h3>
              <p className="text-sm max-w-sm">
                Seleziona un viaggio dalla lista a sinistra per vederne i dettagli o creane uno nuovo per iniziare.
              </p>
              <button 
                onClick={handleCreateNew}
                className="mt-6 px-6 py-2 bg-[#dc2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-colors"
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
