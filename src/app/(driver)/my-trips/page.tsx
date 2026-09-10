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
        <div className="animate-spin h-10 w-10 border-4 border-[#dc2626] border-t-transparent rounded-full"></div>
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
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border border-gray-200">
        <span className="font-bold text-gray-900 text-xl">Oggi: {total} viaggi</span>
        <span className="bg-[#dc2626]/20 text-[#dc2626] px-3 py-1 rounded-full font-bold">
          {completed} / {total}
        </span>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-gray-500 space-y-6">
          <Calendar size={80} className="text-zinc-700" />
          <p className="text-xl font-medium text-center">Nessun viaggio<br/>programmato per oggi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <Link key={trip.id} href={`/my-trips/${trip.id}`} className="block">
              <div className={cn("bg-white rounded-xl shadow-sm border-l-[6px] overflow-hidden p-4 relative active:scale-[0.98] transition-transform", getStatusColor(trip.status))}>
                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {getStatusLabel(trip.status)}
                </div>
                
                <div className="text-3xl font-extrabold text-gray-900 mb-2">{trip.scheduledTime}</div>
                <div className="text-lg font-medium mb-3 pr-16 text-gray-700">{trip.cargoDescription}</div>
                
                <div className="flex items-start gap-2 text-gray-500 mb-3">
                  <MapPin size={20} className="mt-0.5 flex-shrink-0 text-[#dc2626]" />
                  <span className="text-base line-clamp-2 leading-tight">{trip.address}</span>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">{trip.vehicleName}</span>
                  {trip.needsCrane && (
                    <span className="bg-[#dc2626] text-gray-900 text-xs font-bold px-2 py-1 rounded-md">GRU</span>
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
