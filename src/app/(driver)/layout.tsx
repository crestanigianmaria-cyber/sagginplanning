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
    <div className="min-h-screen bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-primary)] flex flex-col">
      <header className="bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] text-[var(--color-saggin-text-primary)] p-5 md:p-6  sticky top-0 z-10 flex justify-between items-center">
        <div>
          <div className="text-sm text-[var(--color-saggin-text-secondary)]">{formattedDate}</div>
          <div className="text-xl font-medium">Ciao, {session?.user?.name || 'Autista'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-saggin-surface)] p-1 rounded shrink-0">
            <img src="/logo.png" alt="Saggin Logo" className="h-6 object-contain" />
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl border border-[var(--color-brand-red)]/20 hover:bg-[var(--color-brand-red)] hover:text-white transition-colors"
            title="Esci"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 pb-[80px] overflow-y-auto bg-[var(--color-saggin-bg)]">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full h-[65px] bg-[var(--color-saggin-surface)] border-t border-[var(--color-saggin-border)] flex justify-around items-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-10">
        <Link href="/my-trips" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname?.includes('/my-trips') ? "text-[var(--color-brand-red)]" : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-secondary)]")}>
          <Truck size={24} />
          <span className="text-xs mt-1 font-medium">Viaggi</span>
        </Link>
        <Link href="/hours" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname === '/hours' ? "text-[var(--color-brand-red)]" : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-secondary)]")}>
          <Clock size={24} />
          <span className="text-xs mt-1 font-medium">Ore</span>
        </Link>
        <Link href="/profile" className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", pathname === '/profile' ? "text-[var(--color-brand-red)]" : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-secondary)]")}>
          <User size={24} />
          <span className="text-xs mt-1 font-medium">Profilo</span>
        </Link>
      </nav>
    </div>
  )
}
