'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Truck, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const today = new Date()
  const dateStr = today.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 text-gray-900 p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-500">{formattedDate}</div>
          <div className="text-xl font-medium">Ciao, {session?.user?.name || 'Autista'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded shrink-0">
            <img src="/logo.png" alt="Saggin Logo" className="h-6 object-contain" />
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 bg-[#dc2626]/10 text-[#dc2626] rounded-lg border border-[#dc2626]/20 hover:bg-[#dc2626] hover:text-white transition-colors"
            title="Esci"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 pb-[80px] overflow-y-auto bg-gray-50">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full h-[65px] bg-white border-t border-gray-200 flex justify-around items-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-10">
        <Link href="/my-trips" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname?.includes('/my-trips') ? "text-[#dc2626]" : "text-gray-500 hover:text-gray-700")}>
          <Truck size={24} />
          <span className="text-xs mt-1 font-medium">Viaggi</span>
        </Link>
        <Link href="/hours" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname === '/hours' ? "text-[#dc2626]" : "text-gray-500 hover:text-gray-700")}>
          <Clock size={24} />
          <span className="text-xs mt-1 font-medium">Ore</span>
        </Link>
        <Link href="/profile" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname === '/profile' ? "text-[#dc2626]" : "text-gray-500 hover:text-gray-700")}>
          <User size={24} />
          <span className="text-xs mt-1 font-medium">Profilo</span>
        </Link>
      </nav>
    </div>
  )
}
