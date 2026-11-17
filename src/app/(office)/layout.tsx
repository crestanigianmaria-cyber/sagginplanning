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
  Bell,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WASTE_TYPE_META,
  getEveningReminderForDate,
  getUpcomingEveningReminders,
  getItalyDateStr,
} from '@/lib/waste-schedule';

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(true);
  const [liveToast, setLiveToast] = useState<any | null>(null);
  const latestNotifIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    try {
      const savedHidden = localStorage.getItem('saggin_office_sidebar_hidden');
      if (savedHidden === 'true') setIsSidebarHidden(true);
      const savedCollapsed = localStorage.getItem('saggin_office_sidebar_collapsed');
      if (savedCollapsed === 'true') setIsCollapsed(true);
    } catch {}
  }, []);

  const toggleDesktopSidebarHidden = () => {
    setIsSidebarHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('saggin_office_sidebar_hidden', String(next));
      } catch {}
      return next;
    });
  };

  const toggleDesktopSidebarCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('saggin_office_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const list = json.data;
        if (list.length > 0) {
          const newest = list[0];
          if (latestNotifIdRef.current && latestNotifIdRef.current !== newest.id) {
            setHasUnread(true);
            setLiveToast(newest);
            setTimeout(() => setLiveToast((cur: any) => (cur?.id === newest.id ? null : cur)), 6000);
          }
          latestNotifIdRef.current = newest.id;
        }
        setNotifications(list);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
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

  const isFullHeight = pathname.startsWith('/planning') || pathname.startsWith('/map');
  const todayItalyDate = getItalyDateStr();
  const todayWasteReminder = getEveningReminderForDate(todayItalyDate);
  const nextWasteReminder = todayWasteReminder || getUpcomingEveningReminders(todayItalyDate, 1)[0] || null;

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
          "fixed inset-y-0 left-0 z-50 bg-[var(--color-saggin-surface)] border-r border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)] transition-all duration-200 ease-in-out md:static flex flex-col shadow-xs overflow-hidden shrink-0",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          isSidebarHidden
            ? "md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none md:translate-x-0"
            : isCollapsed
              ? "md:w-18 md:translate-x-0"
              : "md:w-64 md:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex h-12 md:h-14 items-center border-b border-[var(--color-saggin-border)] shrink-0 gap-3",
          isCollapsed ? "justify-center px-2" : "px-4"
        )}>
          <div className="bg-white p-1 rounded-lg border border-[var(--color-saggin-border)] shrink-0 shadow-2xs">
            <img src="/logo.png" alt="Saggin Logo" className="w-7 h-7 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-lg font-bold font-space tracking-tight text-[var(--color-saggin-text-primary)]">Saggin</span>
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
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
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

        {/* Collapse / Close controls on desktop */}
        <div className="hidden md:flex items-center gap-1.5 p-2 border-t border-[var(--color-saggin-border)]">
          <button
            onClick={toggleDesktopSidebarCollapsed}
            className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            title={isCollapsed ? "Espandi etichette menu" : "Riduci a sole icone"}
          >
            <span className="text-[11px]">{isCollapsed ? '→' : '← Riduci'}</span>
          </button>
          {!isCollapsed && (
            <button
              onClick={toggleDesktopSidebarHidden}
              className="py-1.5 px-2 text-xs font-semibold text-slate-500 hover:text-[var(--color-brand-red)] hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
              title="Chiudi completamente barra laterale"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span className="text-[11px]">Chiudi</span>
            </button>
          )}
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
        <header className="h-12 flex items-center justify-between px-3 md:px-4 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] shrink-0 z-10 shadow-2xs">
          <div className="flex items-center flex-1 gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1.5 -ml-1 rounded-lg md:hidden hover:bg-[var(--color-saggin-elevated)]"
              title="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Toggle Sidebar (Chiudi / Riapri barra laterale) */}
            <button
              onClick={toggleDesktopSidebarHidden}
              className={cn(
                "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0",
                isSidebarHidden
                  ? "bg-red-50 text-[var(--color-brand-red)] border-red-200 hover:bg-red-100 shadow-2xs"
                  : "bg-[var(--color-saggin-elevated)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)] hover:text-[var(--color-saggin-text-primary)] hover:bg-slate-200/70"
              )}
              title={isSidebarHidden ? "Riapri barra laterale (Panoramica, Planning, Mappa, Flotta)" : "Chiudi barra laterale per avere più spazio"}
            >
              {isSidebarHidden ? (
                <>
                  <PanelLeftOpen className="h-4 w-4 shrink-0" />
                  <span>Apri menu</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">Chiudi menu</span>
                </>
              )}
            </button>

            {isSidebarHidden && (
              <div className="hidden md:flex items-center gap-2 pr-2 border-r border-[var(--color-saggin-border)] shrink-0">
                <img src="/logo.png" alt="Saggin" className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold font-space text-[var(--color-saggin-text-primary)]">Saggin</span>
              </div>
            )}

            {/* Titolo Sezione */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-[var(--color-saggin-text-secondary)]">Ufficio:</span>
              <span className="text-xs font-bold font-space text-[var(--color-saggin-text-primary)]">
                {session?.user?.name || 'Operatore'}
              </span>
            </div>
            
            {/* Global Search */}
            <div className="flex-1 max-w-md mx-auto ml-4 hidden sm:block">
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
          
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Promemoria Stasera Immondizie (visibile in tutto il portale ufficio) */}
            {todayWasteReminder && (
              <Link
                href="/planning"
                className={cn(
                  "flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg border shadow-2xs transition-opacity hover:opacity-90",
                  WASTE_TYPE_META[todayWasteReminder.type].pillClass
                )}
                title={`${todayWasteReminder.eveningAction} (ritiro domani ${todayWasteReminder.collectionDateFormatted})`}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Stasera: {WASTE_TYPE_META[todayWasteReminder.type].shortLabel}</span>
              </Link>
            )}

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

                    {nextWasteReminder && (
                      <Link
                        href="/planning"
                        onClick={() => setShowNotifications(false)}
                        className={cn(
                          "block px-3.5 py-2.5 border-b border-[var(--color-saggin-border)] transition-opacity hover:opacity-90",
                          WASTE_TYPE_META[nextWasteReminder.type].bannerClass
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <Trash2 size={11} />
                            {todayWasteReminder ? 'Promemoria Stasera' : 'Prossimo Promemoria Immondizie'}
                          </span>
                          <span className="text-[10px] font-bold">
                            {todayWasteReminder ? 'OGGI SERA' : nextWasteReminder.reminderDateFormatted}
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-0.5">
                          {nextWasteReminder.eveningAction}
                          <span className="font-medium opacity-75 ml-1">
                            (ritiro {nextWasteReminder.collectionDateShort})
                          </span>
                        </div>
                      </Link>
                    )}

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
          isFullHeight ? "overflow-hidden flex flex-col" : "overflow-y-auto"
        )}>
          <div className={cn(
            "text-[var(--color-saggin-text-primary)]",
            isFullHeight 
              ? "w-full h-full p-2 lg:p-2.5 flex flex-col min-h-0" 
              : "p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>
      {/* Live Toast Notifica in tempo reale */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border border-[var(--color-saggin-border)] shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
            liveToast.type === 'success' ? "bg-emerald-500" :
            liveToast.type === 'warning' ? "bg-amber-500 animate-pulse" :
            "bg-[var(--color-brand-red)]"
          )} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[var(--color-saggin-text-primary)]">{liveToast.title}</div>
            <div className="text-[11px] text-[var(--color-saggin-text-secondary)] mt-0.5 line-clamp-2">{liveToast.message}</div>
          </div>
          <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-slate-600 p-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
