import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { CalendarDays, Route, Truck, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.type !== 'OFFICE') redirect('/')

  // Calcolo KPI della giornata
  const today = new Date()
  today.setHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [tripsToday, unassignedTrips, activeDrivers, availableVehicles] = await Promise.all([
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
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-space text-[var(--color-saggin-text-primary)]">Panoramica Operativa</h1>
        <p className="text-[var(--color-saggin-text-secondary)] mt-2">Riepilogo delle operazioni di oggi per la flotta Saggin.</p>
      </div>

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
        
        <div className="bg-[var(--color-saggin-surface)] p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <h2 className="text-lg font-bold font-space mb-4 text-[var(--color-saggin-text-primary)]">Viaggi in Corso (Live)</h2>
          <div className="flex flex-col items-center justify-center h-40 text-[var(--color-saggin-text-secondary)]">
            <Route className="h-8 w-8 mb-2 opacity-20" />
            <p>Mappa live in sviluppo...</p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
