import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CalendarDays, Route, Truck, Users, AlertCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  WASTE_TYPE_META,
  getEveningReminderForDate,
  getUpcomingEveningReminders,
  getItalyDateStr,
} from '@/lib/waste-schedule'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.userType !== 'OFFICE') redirect('/')

  const todayItaly = getItalyDateStr()
  const todayWaste = getEveningReminderForDate(todayItaly)
  const upcomingWaste = getUpcomingEveningReminders(todayItaly, 4)

  // Calcolo KPI della giornata
  const today = new Date()
  today.setHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [tripsToday, unassignedTrips, activeDrivers, availableVehicles, activeTrips] = await Promise.all([
    prisma.trip.count({
      where: { date: { gte: today, lt: tomorrow }, status: { notIn: ['ANNULLATO'] } }
    }),
    prisma.trip.count({
      where: { date: { gte: today, lt: tomorrow }, driverId: null, status: { notIn: ['ANNULLATO'] } }
    }),
    prisma.driver.count({
      where: { status: 'ATTIVO' }
    }),
    prisma.vehicle.count({
      where: { status: 'DISPONIBILE' }
    }),
    prisma.trip.findMany({
      where: { status: 'IN_CORSO' },
      include: { driver: true, vehicle: true },
      orderBy: { actualStartTime: 'desc' },
      take: 5
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">Panoramica Operativa</h1>
        <p className="text-[var(--color-saggin-text-secondary)] mt-2">Riepilogo delle operazioni di oggi per la flotta Saggin.</p>
      </div>

      {todayWaste && (
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${WASTE_TYPE_META[todayWaste.type].bannerClass}`}>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${WASTE_TYPE_META[todayWaste.type].accentBadgeClass}`}>
              <Trash2 className="h-4 w-4" />
              Stasera Immondizie
            </span>
            <div>
              <div className="text-sm font-bold">{todayWaste.eveningAction}</div>
              <div className="text-xs opacity-80">Ritiro previsto domani {todayWaste.collectionDateFormatted.toLowerCase()}</div>
            </div>
          </div>
          <Link href="/planning" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/85 hover:bg-white border border-black/15 transition-colors">
            Apri Planning &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-saggin-text-secondary)]">Viaggi Programmati (Oggi)</h3>
            <div className="p-2 bg-[var(--color-saggin-bg)] rounded-lg text-[var(--color-saggin-text-primary)]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold font-space">{tripsToday}</div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-brand-red)]/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-brand-red)]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-saggin-text-secondary)]">Viaggi Da Assegnare</h3>
            <div className="p-2 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold font-space text-[var(--color-brand-red)]">{unassignedTrips}</div>
          {unassignedTrips > 0 && (
            <Link href="/planning" className="text-xs text-[var(--color-brand-red)] hover:underline mt-2 inline-block font-medium">
              Vedi nel Planning &rarr;
            </Link>
          )}
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-saggin-text-secondary)]">Autisti in Servizio</h3>
            <div className="p-2 bg-[var(--color-saggin-bg)] rounded-lg text-[var(--color-saggin-text-primary)]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold font-space">{activeDrivers}</div>
        </div>

        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-saggin-text-secondary)]">Mezzi Disponibili</h3>
            <div className="p-2 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-bold font-space text-[var(--color-success)]">{availableVehicles}</div>
        </div>
      </div>
      
      {/* Quick Actions & Recent Activity will go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <h2 className="text-lg font-bold font-space mb-4 text-[var(--color-saggin-text-primary)]">Azioni Rapide</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/planning" className="flex flex-col items-center justify-center p-6 bg-[var(--color-saggin-bg)] hover:bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] rounded-xl transition-colors text-center group">
              <CalendarDays className="h-8 w-8 text-[var(--color-saggin-text-secondary)] group-hover:text-[var(--color-brand-red)] transition-colors mb-3" />
              <span className="font-medium">Gestisci Planning</span>
            </Link>
            <Link href="/trips" className="flex flex-col items-center justify-center p-6 bg-[var(--color-saggin-bg)] hover:bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] rounded-xl transition-colors text-center group">
              <Route className="h-8 w-8 text-[var(--color-saggin-text-secondary)] group-hover:text-[var(--color-brand-red)] transition-colors mb-3" />
              <span className="font-medium">Storico Viaggi</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-space text-[var(--color-saggin-text-primary)] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Viaggi in Corso (Live)
            </h2>
            <Link href="/map" className="text-xs font-bold text-[var(--color-brand-red)] hover:underline">
              Apri Mappa Flotta &rarr;
            </Link>
          </div>
          {activeTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-[var(--color-saggin-text-secondary)] text-sm">
              <Route className="h-7 w-7 mb-2 opacity-25" />
              <p>Nessun viaggio attualmente in corso</p>
              <Link href="/map" className="mt-2 text-xs font-semibold text-[var(--color-brand-red)] hover:underline">
                Visualizza posizioni su Mappa Flotta
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeTrips.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-saggin-bg)] border border-[var(--color-saggin-border)]">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[var(--color-saggin-text-primary)] truncate">
                      {t.driver?.name || 'Autista'} • {t.clientName || t.cargoDescription}
                    </div>
                    <div className="text-xs text-[var(--color-saggin-text-secondary)] truncate">
                      {t.vehicle?.name || 'Mezzo N/D'} — {t.address}
                    </div>
                  </div>
                  <span className="ml-3 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    IN CORSO
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Promemoria Raccolta Immondizie (Sera Prima) */}
      <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-lg border border-red-200">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">
                Promemoria Immondizie (Sera Prima del Ritiro)
              </h2>
              <p className="text-xs text-[var(--color-saggin-text-secondary)]">
                Avvisi automatici per ricordare cosa portare fuori la sera prima della raccolta
              </p>
            </div>
          </div>
          <Link href="/planning" className="text-xs font-bold text-[var(--color-brand-red)] hover:underline">
            Vedi nel Planning &rarr;
          </Link>
        </div>

        {upcomingWaste.length === 0 ? (
          <p className="text-sm text-[var(--color-saggin-text-secondary)]">
            Nessun promemoria programmato nei prossimi giorni.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingWaste.map((item) => {
              const isTonight = item.reminderDate === todayItaly
              const meta = WASTE_TYPE_META[item.type]
              return (
                <div
                  key={`${item.reminderDate}-${item.type}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isTonight ? meta.bannerClass : 'bg-[var(--color-saggin-bg)] border-[var(--color-saggin-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${meta.pillClass}`}>
                      {meta.label}
                    </span>
                    {isTonight && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--color-brand-red)] text-white text-[9px] font-extrabold uppercase">
                        Stasera
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-[var(--color-saggin-text-primary)]">
                    {isTonight ? 'Oggi' : item.reminderDateFormatted} (sera)
                  </div>
                  <div className="text-[11px] text-[var(--color-saggin-text-secondary)] mt-0.5">
                    Ritiro: {item.collectionDateShort}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
