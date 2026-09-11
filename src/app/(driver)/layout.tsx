'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Truck, Clock, User, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn, getDriverAvatar } from '@/lib/utils'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const today = new Date()
  const dateStr = today.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' })
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const isTripDetail = pathname?.startsWith('/my-trips/') && pathname !== '/my-trips';

  return (
    <div className="min-h-screen bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-primary)] flex flex-col font-sans">
      {/* Mobile Driver Header (Only shown when not in trip detail to maximize space, or compact) */}
      {!isTripDetail && (
        <header className="bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-2xs">
          {(() => {
            const driverName = session?.user?.name || 'Autista';
            const avatar = getDriverAvatar(driverName, (session?.user as any)?.profilePicture);

            return (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="shrink-0 relative group" title="Visualizza il tuo profilo">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={driverName} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-brand-red)] shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center font-bold text-sm text-[var(--color-saggin-text-primary)]">
                      {driverName.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-success)] border-2 border-white" />
                </Link>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">{formattedDate}</div>
                  <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">
                    Ciao, {driverName.split(' ')[0]}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-lg border border-[var(--color-saggin-border)] shrink-0 shadow-2xs">
              <img src="/logo.png" alt="Saggin Logo" className="h-6 w-6 object-contain" />
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-xl border border-red-200 hover:bg-[var(--color-brand-red)] hover:text-white transition-colors"
              title="Esci dall'account"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
      )}
      
      {/* Mobile Content Area */}
      <main className={cn("flex-1 overflow-y-auto bg-[var(--color-saggin-bg)]", isTripDetail ? "pb-0" : "pb-[75px]")}>
        {children}
      </main>

      {/* Mobile Bottom Navigation (Hidden on trip detail page) */}
      {!isTripDetail && (
        <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-[var(--color-saggin-surface)] border-t border-[var(--color-saggin-border)] flex justify-around items-center z-40 shadow-xs">
          <Link 
            href="/my-trips" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all", 
              pathname?.includes('/my-trips') 
                ? "text-[var(--color-brand-red)] font-bold" 
                : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] font-medium"
            )}
          >
            <Truck size={20} className={pathname?.includes('/my-trips') ? "stroke-[2.5]" : "stroke-[1.75]"} />
            <span className="text-[10px] mt-1">Viaggi</span>
          </Link>

          <Link 
            href="/hours" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all", 
              pathname === '/hours' 
                ? "text-[var(--color-brand-red)] font-bold" 
                : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] font-medium"
            )}
          >
            <Clock size={20} className={pathname === '/hours' ? "stroke-[2.5]" : "stroke-[1.75]"} />
            <span className="text-[10px] mt-1">Ore</span>
          </Link>

          <Link 
            href="/profile" 
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all", 
              pathname === '/profile' 
                ? "text-[var(--color-brand-red)] font-bold" 
                : "text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] font-medium"
            )}
          >
            <User size={20} className={pathname === '/profile' ? "stroke-[2.5]" : "stroke-[1.75]"} />
            <span className="text-[10px] mt-1">Profilo</span>
          </Link>
        </nav>
      )}
    </div>
  )
}
