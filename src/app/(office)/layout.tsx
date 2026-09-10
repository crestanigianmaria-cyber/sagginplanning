'use client';
import { signOut, useSession } from "next-auth/react";
import React, { useState } from 'react';
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

  const navItems = [
    { name: 'Panoramica', href: '/dashboard', icon: BarChart3 },
    { name: 'Planning', href: '/planning', icon: CalendarDays },
    { name: 'Viaggi', href: '/trips', icon: Route },
    { name: 'Mezzi', href: '/vehicles', icon: Truck },
    { name: 'Autisti', href: '/drivers', icon: Users },
    { name: 'Ore Lavoro', href: '/office-hours', icon: Clock },
    { name: 'Mappa', href: '#', icon: Map, disabled: true },
  ];

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-saggin-surface)] border-r border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)] transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center px-6 border-b border-[var(--color-saggin-border)] shrink-0 gap-3">
          <div className="bg-white p-1 rounded-lg border border-[var(--color-saggin-border)] shrink-0 shadow-xs">
            <img src="/logo.png" alt="Saggin Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold font-space tracking-tight text-[var(--color-saggin-text-primary)]">Saggin</span>
            <span className="text-xs uppercase tracking-widest block text-[var(--color-brand-red)] font-semibold -mt-1">Planning OS</span>
          </div>
          <button 
            className="ml-auto md:hidden text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1 rounded-lg hover:bg-[var(--color-saggin-elevated)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== '#';
              
              return (
                <li key={item.name}>
                  {item.disabled ? (
                    <div className="flex items-center px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-400 cursor-not-allowed">
                      <item.icon className="h-4 w-4 mr-3 shrink-0 opacity-40" />
                      {item.name}
                      <span className="ml-auto text-[9px] uppercase tracking-wider bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                        Presto
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 group relative",
                        isActive
                          ? "bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] shadow-xs"
                          : "text-[var(--color-saggin-text-secondary)] hover:bg-[var(--color-saggin-elevated)] hover:text-[var(--color-saggin-text-primary)]"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--color-brand-red)] rounded-r-full" />
                      )}
                      <item.icon className={cn(
                        "h-4 w-4 mr-3 shrink-0 transition-colors",
                        isActive ? "text-[var(--color-brand-red)]" : "text-slate-400 group-hover:text-[var(--color-saggin-text-primary)]"
                      )} />
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer (User Profile & Logout) */}
        <div className="p-4 border-t border-[var(--color-saggin-border)] shrink-0 bg-[var(--color-saggin-surface)]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] mb-2">
            <div className="w-9 h-9 rounded-full bg-white border border-[var(--color-saggin-border)] flex items-center justify-center text-[var(--color-saggin-text-primary)] font-bold font-space text-sm shrink-0 shadow-xs">
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
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-[var(--color-brand-red)] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Esci dall'account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--color-saggin-bg)]">
        
        {/* Topbar (Desktop & Mobile) */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[var(--color-saggin-surface)] border-b border-[var(--color-saggin-border)] shrink-0 z-10 shadow-xs">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] p-1.5 -ml-1 mr-3 rounded-lg md:hidden hover:bg-[var(--color-saggin-elevated)]"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Titolo Sezione */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-saggin-text-secondary)]">Benvenuto,</span>
              <span className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                {session?.user?.name || 'Ufficio'}
              </span>
            </div>
            
            {/* Global Search */}
            <div className="flex-1 max-w-md mx-auto ml-6 md:ml-10 hidden sm:block">
              <div className="relative flex items-center w-full h-9 rounded-xl bg-[var(--color-saggin-elevated)] border border-[var(--color-saggin-border)] focus-within:border-[var(--color-brand-red)] focus-within:bg-white transition-all px-3">
                <Search className="h-4 w-4 text-[var(--color-saggin-text-secondary)] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Cerca viaggio, cantiere, targa, autista..." 
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
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[var(--color-saggin-text-secondary)] bg-[var(--color-saggin-elevated)] px-3 py-1.5 rounded-lg border border-[var(--color-saggin-border)]">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--color-brand-red)]" />
              <span>{new Date().toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            
            {/* Notifiche */}
            <button className="relative p-2 text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)] hover:bg-[var(--color-saggin-elevated)] rounded-xl transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-brand-red)]" />
            </button>
          </div>
        </header>

        {/* Page Content with crisp scroll */}
        <main className="flex-1 overflow-auto bg-[var(--color-saggin-bg)]">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-full text-[var(--color-saggin-text-primary)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
