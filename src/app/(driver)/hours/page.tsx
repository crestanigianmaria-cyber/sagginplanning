'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Clock } from 'lucide-react'

export default function HoursPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return
    const driverId = (session.user as any).id || ''
    fetch(`/api/trips?driverId=${driverId}`)
      .then(res => res.json())
      .then(data => {
        const list = data.success && Array.isArray(data.data) ? data.data : []
        setTrips(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin h-10 w-10 border-4 border-[#dc2626] border-t-transparent rounded-full"></div>
    </div>
  )

  const completed = trips.filter((t: any) => t.status === 'COMPLETATO')
  const totalMinutes = completed.reduce((sum: number, t: any) => sum + (t.workedMinutes || 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  const weekData = weekDays.map((day, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const dayStr = d.toISOString().split('T')[0]
    const dayTrips = completed.filter((t: any) => t.date?.startsWith(dayStr))
    const mins = dayTrips.reduce((s: number, t: any) => s + (t.workedMinutes || 0), 0)
    return { day, hours: parseFloat((mins / 60).toFixed(1)) }
  })

  const weekTotal = weekData.reduce((s, d) => s + d.hours, 0).toFixed(1)
  const todayStr = today.toISOString().split('T')[0]
  const todayTrips = completed.filter((t: any) => t.date?.startsWith(todayStr))
  const todayMins = todayTrips.reduce((s: number, t: any) => s + (t.workedMinutes || 0), 0)
  const todayHours = (todayMins / 60).toFixed(1)
  const todayPct = Math.min(100, (parseFloat(todayHours) / 8) * 100)
  const maxWeekHours = Math.max(...weekData.map(d => d.hours), 1)
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Riepilogo Ore</h1>

      <section className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Oggi</h2>
        <div className="text-5xl font-black text-gray-900 mb-1">
          {todayHours} <span className="text-2xl text-gray-500 font-medium">/ 8h</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mt-4 mb-6 overflow-hidden">
          <div className="bg-[#dc2626] h-3 rounded-full transition-all" style={{ width: todayPct + '%' }} />
        </div>
        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3">Viaggi completati oggi:</h3>
        {todayTrips.length === 0 ? (
          <p className="text-zinc-600 text-sm">Nessun viaggio completato oggi</p>
        ) : (
          <div className="space-y-2">
            {todayTrips.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="font-medium text-gray-700 truncate mr-4 text-sm">{t.cargoDescription}</span>
                <span className="font-bold text-[#dc2626] whitespace-nowrap text-sm">
                  {t.workedMinutes ? Math.floor(t.workedMinutes / 60) + 'h ' + (t.workedMinutes % 60) + 'm' : 'N/D'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Questa Settimana</h2>
        <div className="text-3xl font-black text-gray-900 mb-6">
          {weekTotal} <span className="text-lg text-gray-500 font-medium">ore totali</span>
        </div>
        <div className="flex items-end justify-between h-28 gap-1.5">
          {weekData.map((d, i) => {
            const pct = maxWeekHours > 0 ? (d.hours / maxWeekHours) * 100 : 0
            const isToday = i === todayIdx
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                {d.hours > 0 && <div className="text-[10px] font-bold text-gray-500">{d.hours}</div>}
                <div className="w-full bg-gray-100 rounded-t-md flex-1 relative overflow-hidden">
                  <div
                    className={'absolute bottom-0 w-full rounded-t-md ' + (isToday ? 'bg-[#dc2626]' : 'bg-zinc-600')}
                    style={{ height: pct + '%' }}
                  />
                </div>
                <div className={'text-xs font-bold ' + (isToday ? 'text-[#dc2626]' : 'text-gray-500')}>{d.day}</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 border border-gray-200 flex items-center gap-4">
        <div className="p-3 bg-[#dc2626]/10 rounded-xl border border-[#dc2626]/20">
          <Clock size={28} className="text-[#dc2626]" />
        </div>
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Totale ultimi 30gg</div>
          <div className="text-2xl font-black text-gray-900">{totalHours} ore</div>
          <div className="text-xs text-gray-500">{completed.length} viaggi completati</div>
        </div>
      </section>
    </div>
  )
}
