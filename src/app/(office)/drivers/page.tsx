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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 md:p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--color-saggin-bg)]/50 rounded-xl border border-[var(--color-saggin-border)]/50 shadow-inner">
            <Users className="h-7 w-7 text-[var(--color-brand-red)]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-saggin-text-primary)] tracking-tight">Autisti</h1>
            <p className="text-[var(--color-saggin-text-secondary)] mt-1">Gestione personale e credenziali app mobile</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-red)] text-white text-sm font-medium rounded-xl hover:bg-[#b91c1c] transition-all  hover:">
          <Plus className="h-4 w-4" />
          Nuovo Autista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-[var(--color-saggin-surface)] rounded-2xl shadow-xl border border-[var(--color-saggin-border)] overflow-hidden flex flex-col hover:border-[var(--color-saggin-border)] transition-colors">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-5 md:p-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xl font-semibold text-[var(--color-saggin-text-primary)] shadow-inner border border-zinc-600">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-saggin-text-primary)]">{driver.name}</h3>
                    <div className="text-xs font-medium text-[var(--color-saggin-text-secondary)] mt-0.5 uppercase tracking-wider">
                      {driver.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center text-sm text-[var(--color-saggin-text-secondary)]">
                  <Phone className="h-4 w-4 mr-3 text-[var(--color-saggin-text-secondary)]" />
                  N/A
                </div>
                <div className="flex items-center text-sm text-[var(--color-saggin-text-secondary)]">
                  <Truck className="h-4 w-4 mr-3 text-[var(--color-saggin-text-secondary)]" />
                  <span className="text-[var(--color-saggin-text-secondary)] mr-1">Mezzo base:</span> {driver.defaultVehicle?.name || 'Nessuno'}
                </div>
                <div className="flex items-center text-sm">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                    driver.status === 'ATTIVO' ? 'bg-green-500/10 text-green-700 border border-green-500/20' : 'bg-amber-500/10 text-[var(--color-warning)] border border-amber-500/20'
                  }`}>
                    {driver.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-saggin-bg)] border-t border-[var(--color-saggin-border)] p-5 md:p-6 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] hover:border-zinc-600 rounded-xl text-sm font-medium text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all ">
                <Edit className="h-4 w-4" />
                Modifica
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] hover:border-[var(--color-brand-red)]/50 rounded-xl text-sm font-medium text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-all " title="Reimposta PIN">
                <Key className="h-4 w-4 text-[var(--color-brand-red)]" />
                Reset PIN
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
