import React from 'react';
import { Users, Plus, Key, Edit, Phone, Truck } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    include: { defaultVehicle: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-700/50 shadow-inner">
            <Users className="h-7 w-7 text-[#dc2626]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Autisti</h1>
            <p className="text-zinc-400 mt-1">Gestione personale e credenziali app mobile</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white text-sm font-medium rounded-lg hover:bg-[#b91c1c] transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
          <Plus className="h-4 w-4" />
          Nuovo Autista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-[#111113] rounded-2xl shadow-xl border border-zinc-800 overflow-hidden flex flex-col hover:border-zinc-700 transition-colors">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xl font-bold text-white shadow-inner border border-zinc-600">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{driver.name}</h3>
                    <div className="text-xs font-medium text-zinc-400 mt-0.5 uppercase tracking-wider">
                      {driver.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center text-sm text-zinc-300">
                  <Phone className="h-4 w-4 mr-3 text-zinc-500" />
                  N/A
                </div>
                <div className="flex items-center text-sm text-zinc-300">
                  <Truck className="h-4 w-4 mr-3 text-zinc-500" />
                  <span className="text-zinc-500 mr-1">Mezzo base:</span> {driver.defaultVehicle?.name || 'Nessuno'}
                </div>
                <div className="flex items-center text-sm">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    driver.status === 'ATTIVO' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {driver.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0c0c0e] border-t border-zinc-800 p-4 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#111113] border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-all shadow-sm">
                <Edit className="h-4 w-4" />
                Modifica
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#111113] border border-zinc-700 hover:border-[#dc2626]/50 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-all shadow-sm" title="Reimposta PIN">
                <Key className="h-4 w-4 text-[#dc2626]" />
                Reset PIN
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
