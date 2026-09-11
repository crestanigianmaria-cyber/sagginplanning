'use client';
import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Route,
  Truck,
  Users,
  Clock,
  Map,
  BarChart3,
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { name: string; href: string; icon: any; disabled?: boolean }[] = [
    { name: 'Panoramica', href: '/dashboard', icon: BarChart3 },
    { name: 'Planning', href: '/planning', icon: CalendarDays },
    { name: 'Mappa Flotta', href: '/map', icon: Map },
    { name: 'Report', href: '/reports', icon: BarChart3 },
    { name: 'Viaggi', href: '/trips', icon: Route },
    { name: 'Mezzi', href: '/vehicles', icon: Truck },
    { name: 'Autisti', href: '/drivers', icon: Users },
    { name: 'Ore Lavoro', href: '/office-hours', icon: Clock },
  ];

  const isPlanning = pathname.startsWith('/planning');

  return (
    <div className="flex h-screen bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-primary)] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Clean White with 1px Border) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-[var(--color-saggin-surface)] border-r border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)] transition-all duration-200 ease-in-out md:static md:translate-x-0 flex flex-col shadow-xs",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-18" : "md:w-64"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex h-16 items-center border-b border-[var(--color-saggin-border)] shrink-0 gap-3",
          isCollapsed ? "justify-center px-2" : "px-5"
        )}>
          <div className="bg-white p-1 rounded-lg border border-[var(--color-saggin-border)] shrink-0 shadow-2xs">
            <img src="/logo.png" alt="Saggin Logo" className="w-8 h-8 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-xl font-bold font-space tracking-tight text-[var(--color-saggin-text-primary)]">Saggin</span>
              <span className="text-[10px] uppercase tracking-widest block text-[var(--color-brand-red)] font-bold -mt-1">Planning OS</span>
            </div>
          )}
          <button 
            className="ml-auto md:hidden text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1 rounded-lg hover:bg-[var(--color-saggin-elevated)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className={cn("space-y-1.5", isCollapsed ? "px-2" : "px-3")}>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== '#';
              
              return (
                <li key={item.name}>
                  {item.disabled ? (
                    <div className={cn(
                      "flex items-center text-xs font-medium rounded-xl text-slate-400 cursor-not-allowed",
                      isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
                    )}
                    title={item.name + " (Presto disponibile)"}
                    >
                      <item.icon className="h-4 w-4 opacity-40 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">{item.name}</span>
                          <span className="ml-auto text-[9px] uppercase tracking-wider bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                            Presto
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center text-sm font-semibold rounded-xl transition-all duration-150 group relative",
                        isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5",
                        isActive
                          ? "bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] shadow-2xs font-bold"
                          : "text-[var(--color-saggin-text-secondary)] hover:bg-[var(--color-saggin-elevated)] hover:text-[var(--color-saggin-text-primary)]"
                      )}
                      onClick={() => setSidebarOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--color-brand-red)] rounded-r-full" />
                      )}
                      <item.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-[var(--color-brand-red)] stroke-[2.2]" : "text-slate-500 group-hover:text-[var(--color-saggin-text-primary)]"
                      )} />
                      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle button on desktop */}
        <div className="hidden md:flex items-center justify-center p-2 border-t border-[var(--color-saggin-border)]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-1.5 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            title={isCollapsed ? "Espandi barra laterale" : "Riduci barra laterale"}
          >
            <span className="text-[11px]">{isCollapsed ? '→' : '← Riduci'}</span>
          </button>
        </div>

        {/* Sidebar Footer (User Profile & Logout) */}
        <div className={cn("border-t border-[var(--color-saggin-border)] shrink-0 bg-[var(--color-saggin-surface)]", isCollapsed ? "p-2" : "p-3")}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] mb-2">
                <div className="w-8 h-8 rounded-full bg-white border border-[var(--color-saggin-border)] flex items-center justify-center text-[var(--color-saggin-text-primary)] font-bold font-space text-xs shrink-0 shadow-2xs">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-[var(--color-saggin-text-primary)] truncate">
                    {session?.user?.name || 'Utente Ufficio'}
                  </span>
                  <span className="text-[10px] text-[var(--color-saggin-text-secondary)] font-medium">
                    Portale Ufficio
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="flex items-center justify-center w-full px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-red)] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Esci
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] flex items-center justify-center text-[var(--color-saggin-text-primary)] font-bold font-space text-xs shadow-2xs"
                title={session?.user?.name || 'Utente Ufficio'}
              >
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="p-2 text-[var(--color-brand-red)] hover:bg-red-50 rounded-lg transition-colors"
                title="Esci"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--color-saggin-bg)]">
        
        {/* Topbar (Desktop & Mobile) */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] shrink-0 z-10 shadow-2xs">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1.5 -ml-1 mr-3 rounded-lg md:hidden hover:bg-[var(--color-saggin-elevated)]"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Titolo Sezione */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--color-saggin-text-secondary)]">Ufficio:</span>
              <span className="text-sm font-bold font-space text-[var(--color-saggin-text-primary)]">
                {session?.user?.name || 'Operatore'}
              </span>
            </div>
            
            {/* Global Search */}
            <div className="flex-1 max-w-md mx-auto ml-6 md:ml-10 hidden sm:block">
              <div className="relative flex items-center w-full h-8.5 rounded-xl bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] focus-within:border-[var(--color-brand-red)] focus-within:bg-white transition-all px-3">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Cerca viaggio, cliente, indirizzo, autista..." 
                  className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--color-saggin-text-primary)] px-2.5 placeholder:text-slate-400"
                />
                <kbd className="hidden lg:inline-flex items-center px-1.5 font-mono text-[9px] font-semibold text-slate-400 bg-white border border-[var(--color-saggin-border)] rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {/* Data Oggi */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-elevated)] px-3 py-1 rounded-lg border border-[var(--color-saggin-border)]">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--color-brand-red)]" />
              <span>{new Date().toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            
            {/* Notifiche con Dropdown Interattivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setHasUnread(false);
                }}
                className="relative p-1.5 text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] hover:bg-[var(--color-saggin-elevated)] rounded-lg transition-colors"
                title="Notifiche e attività flotta"
              >
                <Bell className="h-4 w-4" />
                {hasUnread && notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--color-brand-red)] animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-2xl border border-[var(--color-saggin-border)] shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3.5 border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={15} className="text-[var(--color-brand-red)]" />
                        <h4 className="text-xs font-bold font-space text-[var(--color-saggin-text-primary)] uppercase tracking-wider">
                          Attività Flotta & Corse
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {notifications.length} eventi
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                          Nessuna notifica recente
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div 
                            key={notif.id} 
                            className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                            onClick={() => setShowNotifications(false)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className={cn(
                                "text-xs font-bold leading-tight",
                                notif.type === 'success' ? "text-emerald-700" :
                                notif.type === 'warning' ? "text-amber-700" :
                                "text-slate-800"
                              )}>
                                {notif.title}
                              </span>
                              <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-[var(--color-saggin-border)] bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Aggiornato in tempo reale dal sistema
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn(
          "flex-1 min-h-0 bg-[var(--color-saggin-bg)]",
          isPlanning ? "overflow-hidden flex flex-col" : "overflow-y-auto"
        )}>
          <div className={cn(
            "text-[var(--color-saggin-text-primary)]",
            isPlanning 
              ? "w-full h-full p-3 lg:p-4 flex flex-col min-h-0" 
              : "p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
