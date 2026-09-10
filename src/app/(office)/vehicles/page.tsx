import React from 'react';
import Link from 'next/link';
import { Truck, Plus, CheckCircle, XCircle, Search, Anchor } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-700/50 shadow-inner">
            <Truck className="h-7 w-7 text-[#dc2626]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Parco Mezzi</h1>
            <p className="text-zinc-400 mt-1">Gestisci la flotta e verifica le disponibilità</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cerca per targa o nome..." 
              className="w-full pl-9 pr-4 py-2 bg-[#111113] border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626]/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Mezzo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <Link key={v.id} href={`/vehicles/${v.id}`} className="group block">
            <div className="bg-[#111113] rounded-2xl p-6 border border-zinc-800 shadow-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:border-zinc-700 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-zinc-800/30 to-transparent -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#dc2626] transition-colors">{v.name}</h3>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-800 text-zinc-300 mt-2 border border-zinc-700 shadow-inner uppercase tracking-wider">
                    {v.licensePlate}
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${
                  v.status === 'DISPONIBILE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  v.status === 'MANUTENZIONE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {v.status}
                </div>
              </div>

              <div className="space-y-3 mb-6 relative">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tipologia</span>
                  <span className="font-medium text-zinc-200">{v.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Portata Utile</span>
                  <span className="font-medium text-zinc-200">{v.payloadCapacity.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tara</span>
                  <span className="font-medium text-zinc-200">{v.tare.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between relative">
                {v.hasCrane ? (
                  <div className="flex items-center text-sm font-medium text-[#dc2626] bg-[#dc2626]/10 px-2 py-1 rounded-md border border-[#dc2626]/20">
                    <Anchor className="h-4 w-4 mr-2" />
                    Gru: {v.craneModel || 'Sì'}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800/50">Nessuna gru</div>
                )}
                
                <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                  Dettagli <span className="text-[#dc2626] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
        {vehicles.length === 0 && (
           <div className="col-span-full py-12 text-center bg-[#111113] rounded-2xl border border-zinc-800 border-dashed">
             <Truck className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
             <p className="text-zinc-400 font-medium">Nessun mezzo registrato.</p>
           </div>
        )}
      </div>
    </div>
  );
}
