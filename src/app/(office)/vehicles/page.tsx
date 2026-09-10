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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 md:p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--color-saggin-bg)]/50 rounded-xl border border-[var(--color-saggin-border)]/50 shadow-inner">
            <Truck className="h-7 w-7 text-[var(--color-brand-red)]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-saggin-text-primary)] tracking-tight">Parco Mezzi</h1>
            <p className="text-[var(--color-saggin-text-secondary)] mt-1">Gestisci la flotta e verifica le disponibilità</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-saggin-text-secondary)]" />
            <input 
              type="text" 
              placeholder="Cerca per targa o nome..." 
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl text-sm text-[var(--color-saggin-text-primary)] placeholder:text-[var(--color-saggin-text-secondary)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[var(--color-brand-red)]/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-red)] text-white text-sm font-medium rounded-xl hover:bg-[#b91c1c] transition-all  hover:">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Mezzo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <Link key={v.id} href={`/vehicles/${v.id}`} className="group block">
            <div className="bg-[var(--color-saggin-surface)] rounded-2xl p-6 border border-[var(--color-saggin-border)] shadow-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:border-[var(--color-saggin-border)] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-zinc-800/30 to-transparent -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-saggin-text-primary)] group-hover:text-[var(--color-brand-red)] transition-colors">{v.name}</h3>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-secondary)] mt-2 border border-[var(--color-saggin-border)] shadow-inner uppercase tracking-wider">
                    {v.licensePlate}
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border  ${
                  v.status === 'DISPONIBILE' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 
                  v.status === 'MANUTENZIONE' ? 'bg-amber-500/10 text-[var(--color-warning)] border-amber-500/20' :
                  'bg-red-500/10 text-red-700 border-red-500/20'
                }`}>
                  {v.status}
                </div>
              </div>

              <div className="space-y-3 mb-6 relative">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-saggin-text-secondary)]">Tipologia</span>
                  <span className="font-medium text-[var(--color-saggin-text-primary)]">{v.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-saggin-text-secondary)]">Portata Utile</span>
                  <span className="font-medium text-[var(--color-saggin-text-primary)]">{v.payloadCapacity.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-saggin-text-secondary)]">Tara</span>
                  <span className="font-medium text-[var(--color-saggin-text-primary)]">{v.tare.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-saggin-border)]/80 flex items-center justify-between relative">
                {v.hasCrane ? (
                  <div className="flex items-center text-sm font-medium text-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 px-2 py-1 rounded-lg border border-[var(--color-brand-red)]/20">
                    <Anchor className="h-4 w-4 mr-2" />
                    Gru: {v.craneModel || 'Sì'}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-surface)]/50 px-2 py-1 rounded-lg border border-[var(--color-saggin-border)]/50">Nessuna gru</div>
                )}
                
                <span className="text-sm font-medium text-[var(--color-saggin-text-secondary)] group-hover:text-[var(--color-saggin-text-primary)] transition-colors flex items-center gap-1">
                  Dettagli <span className="text-[var(--color-brand-red)] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
        {vehicles.length === 0 && (
           <div className="col-span-full py-12 text-center bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] border-dashed">
             <Truck className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
             <p className="text-[var(--color-saggin-text-secondary)] font-medium">Nessun mezzo registrato.</p>
           </div>
        )}
      </div>
    </div>
  );
}
