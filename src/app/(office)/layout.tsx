'use client';
import { signOut } from "next-auth/react";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Route,
  Truck,
  Users,
  Map,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Planning', href: '/planning', icon: CalendarDays },
    { name: 'Viaggi', href: '/trips', icon: Route },
    { name: 'Mezzi', href: '/vehicles', icon: Truck },
    { name: 'Autisti', href: '/drivers', icon: Users },
    { name: 'Mappa', href: '#', icon: Map, disabled: true },
    { name: 'Report', href: '#', icon: BarChart3, disabled: true },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 text-slate-700 transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center px-6 border-b border-slate-200 shrink-0 gap-3">
          <div className="bg-white p-1 rounded-lg shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">Saggin Planning</span>
          <button 
            className="ml-auto md:hidden text-slate-500 hover:text-slate-900"
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
                    <div className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-500 cursor-not-allowed">
                      <item.icon className="h-5 w-5 mr-3 shrink-0" />
                      {item.name}
                      <span className="ml-auto text-[10px] uppercase tracking-wider bg-slate-50/50 text-slate-500 px-2 py-1 rounded-lg">
                        Presto
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-slate-50/80 text-slate-900 "
                          : "text-slate-500 hover:bg-slate-50/40 hover:text-slate-900"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-900 rounded-r-full shadow-[0_0_10px_#dc2626]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 mr-3 shrink-0 transition-colors",
                        isActive ? "text-rose-900" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-5 md:p-6 border-t border-slate-200 shrink-0 bg-[#0c0c0e]">
          <div className="flex items-center mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-lg font-semibold text-slate-900 shadow-sm shadow-red-900/20">
              S
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-900">Saggin Planning</p>
              <p className="text-xs text-slate-500">Portale Ufficio</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center justify-center w-full px-4 py-2.5 mt-2 text-sm font-semibold bg-rose-900/10 text-rose-900 border border-rose-900/20 rounded-xl hover:bg-rose-900 hover:text-white transition-all ">
            <LogOut className="h-4 w-4 mr-3" />
            Esci
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200 md:hidden shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-900 p-1 -ml-1 rounded-lg hover:bg-slate-50"
            >
              <Menu strokeWidth={1.5} className="h-6 w-6" />
            </button>
            <span className="ml-3 font-semibold text-slate-900 flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg shrink-0">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              Saggin Planning
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-5 md:p-6 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-full text-slate-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
