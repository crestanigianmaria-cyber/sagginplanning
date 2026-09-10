'use client';
import { signOut, useSession } from "next-auth/react";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  CalendarDays,
  Route,
  Truck,
  Users,
  Clock,
  Map,
  BarChart3,
  LogOut,
  Menu,
  X
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
    <div className="flex h-screen bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-saggin-surface)] border-r border-[var(--color-saggin-border)] text-[var(--color-saggin-text-secondary)] transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col ",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center px-6 border-b border-[var(--color-saggin-border)] shrink-0 gap-3">
          <div className="bg-[var(--color-saggin-surface)] p-1 rounded-lg shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[var(--color-saggin-text-primary)]">Saggin Planning</span>
          <button 
            className="ml-auto md:hidden text-[var(--color-saggin-text-secondary)] hover:text-[var(--color-saggin-text-primary)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== '#';
              
              return (
                <li key={item.name}>
                  {item.disabled ? (
                    <div className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-[var(--color-saggin-text-secondary)] cursor-not-allowed">
                      <item.icon className="h-5 w-5 mr-3 shrink-0" />
                      {item.name}
                      <span className="ml-auto text-[10px] uppercase tracking-wider bg-[var(--color-saggin-bg)]/50 text-[var(--color-saggin-text-secondary)] px-2 py-1 rounded-lg">
                        Presto
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-[var(--color-saggin-bg)]/80 text-[var(--color-saggin-text-primary)] "
                          : "text-[var(--color-saggin-text-secondary)] hover:bg-[var(--color-saggin-bg)]/40 hover:text-[var(--color-saggin-text-primary)]"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-brand-red)] rounded-r-full shadow-[0_0_10px_#dc2626]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 mr-3 shrink-0 transition-colors",
                        isActive ? "text-[var(--color-brand-red)]" : "text-[var(--color-saggin-text-secondary)] group-hover:text-[var(--color-saggin-text-secondary)]"
                      )} />
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[var(--color-saggin-surface)]">
        {/* Mobile Header */}


        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-5 md:p-6 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-full text-[var(--color-saggin-text-primary)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
