'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MapPin, Calendar, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trip = {
  id: string
  status: 'DA_FARE' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
  scheduledTime: string
  cargoDescription: string
  address: string
  vehicleName: string
  needsCrane: boolean
}

export default function MyTripsPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      const today = new Date().toISOString().split('T')[0];
      fetch(`/api/trips?date=${today}&driverId=${(session.user as any).id || ''}`)
        .then(res => res.json())
        .then(data => {
          setTrips(data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []))
          setLoading(false)
        })
        .catch(e => {
          console.error(e)
          setLoading(false)
        })
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-rose-900 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const completed = trips.filter(t => t.status === 'COMPLETATO').length
  const total = trips.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DA_FARE': return 'border-l-zinc-600'
      case 'IN_CORSO': return 'border-l-[#dc2626]'
      case 'COMPLETATO': return 'border-l-emerald-600'
      case 'ANNULLATO': return 'border-l-red-800'
      default: return 'border-l-zinc-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DA_FARE': return 'DA FARE'
      case 'IN_CORSO': return 'IN CORSO'
      case 'COMPLETATO': return 'COMPLETATO'
      case 'ANNULLATO': return 'ANNULLATO'
      default: return status
    }
  }

  return (
    <div className="p-5 md:p-6 space-y-4">
      <div className="bg-white rounded-xl p-5 md:p-6  flex justify-between items-center border border-slate-200">
        <span className="font-semibold text-slate-900 text-xl">Oggi: {total} viaggi</span>
        <span className="bg-rose-900/20 text-rose-900 px-3 py-1 rounded-full font-semibold">
          {completed} / {total}
        </span>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-slate-500 space-y-6">
          <Calendar size={80} className="text-zinc-700" />
          <p className="text-xl font-medium text-center">Nessun viaggio<br/>programmato per oggi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <Link key={trip.id} href={`/my-trips/${trip.id}`} className="block">
              <div className={cn("bg-white rounded-xl  border-l-[6px] overflow-hidden p-5 md:p-6 relative active:scale-[0.98] transition-transform", getStatusColor(trip.status))}>
                <div className="absolute top-5 md:p-6 right-4 text-xs font-semibold px-2 py-1 bg-slate-50 text-slate-700 rounded">
                  {getStatusLabel(trip.status)}
                </div>
                
                <div className="text-3xl font-extrabold text-slate-900 mb-2">{trip.scheduledTime}</div>
                <div className="text-lg font-medium mb-3 pr-16 text-slate-700">{trip.cargoDescription}</div>
                
                <div className="flex items-start gap-2 text-slate-500 mb-3">
                  <MapPin size={20} className="mt-0.5 flex-shrink-0 text-rose-900" />
                  <span className="text-base line-clamp-2 leading-tight">{trip.address}</span>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-500">{trip.vehicleName}</span>
                  {trip.needsCrane && (
                    <span className="bg-rose-900 text-white text-xs font-semibold px-2 py-1 rounded-lg">GRU</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
