import React from 'react';
import { Users, Plus, Key, Edit, Phone, Truck, Clock, CheckCircle, Navigation } from 'lucide-react';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';

export default async function DriversPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

  const drivers = await prisma.driver.findMany({
    include: { 
      defaultVehicle: true,
      trips: {
        where: {
          date: { gte: startOfWeek }
        }
      },
      manualHours: {
        where: {
          date: { gte: startOfWeek }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--color-saggin-surface)] rounded-xl border border-[var(--color-saggin-border)]">
            <Users className="h-7 w-7 text-[var(--color-brand-red)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)] tracking-tight">Autisti</h1>
            <p className="text-sm text-[var(--color-saggin-text-secondary)] mt-0.5">Gestione squadra, foto profilo e monitoraggio stato in tempo reale</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-brand-red)] text-white text-sm font-semibold rounded-xl hover:bg-[#b91c1c] transition-all shadow-sm">
          <Plus className="h-4 w-4" />
          Nuovo Autista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          // Check if driver has an active trip right now
          const activeTrip = driver.trips.find((t: any) => 
            t.status === 'IN_CORSO' && new Date(t.date) >= today && new Date(t.date) < tomorrow
          );

          // Calculate week hours
          const tripMinutes = driver.trips
            .filter((t: any) => t.status === 'COMPLETATO')
            .reduce((sum: number, t: any) => sum + (t.workedMinutes || 0), 0);
          
          const manualMinutes = driver.manualHours
            .reduce((sum: number, m: any) => sum + m.minutes, 0);

          const weekHours = ((tripMinutes + manualMinutes) / 60).toFixed(1);

          return (
            <div 
              key={driver.id} 
              className={cn(
                "bg-[var(--color-saggin-surface)] rounded-2xl border overflow-hidden flex flex-col transition-all",
                activeTrip 
                  ? "border-[var(--color-warning)] shadow-[0_0_20px_rgba(245,166,35,0.15)]" 
                  : "border-[var(--color-saggin-border)] hover:border-[var(--color-saggin-border)]/80"
              )}
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    {driver.profilePicture ? (
                      <img 
                        src={driver.profilePicture} 
                        alt={driver.name} 
                        className="h-14 w-14 rounded-full object-cover border-2 border-[var(--color-saggin-border)] shadow-sm"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[var(--color-saggin-elevated)] flex items-center justify-center text-xl font-bold font-space text-[var(--color-saggin-text-primary)] border border-[var(--color-saggin-border)]">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold font-space text-[var(--color-saggin-text-primary)]">{driver.name}</h3>
                      <div className="text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider">
                        {driver.role === 'AUTISTA_UFFICIO' ? 'Autista / Ufficio' : 'Autista'}
                      </div>
                    </div>
                  </div>

                  {/* Badge In Viaggio Ora */}
                  {activeTrip ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-warning)]/15 border border-[var(--color-warning)]/40 text-[var(--color-warning)]">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-ping" />
                      In viaggio
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      driver.status === 'ATTIVO' 
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    )}>
                      {driver.status === 'ATTIVO' ? 'Attivo' : 'Inattivo'}
                    </span>
                  )}
                </div>

                {/* Mezzo & Telefono */}
                <div className="space-y-2.5 pt-2 border-t border-[var(--color-saggin-border)]/60 text-sm">
                  <div className="flex items-center justify-between text-[var(--color-saggin-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[var(--color-saggin-text-secondary)]" />
                      <span className="text-xs">Mezzo Assegnato:</span>
                    </div>
                    <span className="font-semibold text-xs text-[var(--color-saggin-text-primary)]">
                      {driver.defaultVehicle?.name || 'Senza mezzo fisso'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--color-saggin-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[var(--color-saggin-text-secondary)]" />
                      <span className="text-xs">Telefono:</span>
                    </div>
                    <span className="font-mono text-xs text-[var(--color-saggin-text-primary)]">
                      +39 340 000 0000
                    </span>
                  </div>
                </div>

                {/* Mini Statistica: Ore Questa Settimana */}
                <div className="p-3 bg-[var(--color-saggin-bg)] rounded-xl border border-[var(--color-saggin-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-saggin-text-secondary)] font-medium">
                    <Clock size={15} className="text-[var(--color-brand-red)]" />
                    <span>Ore questa settimana:</span>
                  </div>
                  <span className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                    {weekHours}h
                  </span>
                </div>
              </div>

              {/* Bottoni azione */}
              <div className="bg-[var(--color-saggin-bg)]/80 border-t border-[var(--color-saggin-border)] p-3 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl text-xs font-semibold text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-colors">
                  <Edit className="h-3.5 w-3.5" />
                  Modifica
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl text-xs font-semibold text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] transition-colors">
                  <Key className="h-3.5 w-3.5" />
                  Reset PIN
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
