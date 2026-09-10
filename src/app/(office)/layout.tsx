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
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-gray-700 transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center px-6 border-b border-gray-200 shrink-0 gap-3">
          <div className="bg-white p-1 rounded-md shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Saggin Planning</span>
          <button 
            className="ml-auto md:hidden text-gray-500 hover:text-gray-900"
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
                    <div className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-zinc-600 cursor-not-allowed">
                      <item.icon className="h-5 w-5 mr-3 shrink-0" />
                      {item.name}
                      <span className="ml-auto text-[10px] uppercase tracking-wider bg-gray-100/50 text-gray-500 px-2 py-1 rounded-md">
                        Presto
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-gray-100/80 text-gray-900 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                          : "text-gray-500 hover:bg-gray-100/40 hover:text-gray-900"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#dc2626] rounded-r-full shadow-[0_0_10px_#dc2626]" />
                      )}
                      <item.icon className={cn(
                        "h-5 w-5 mr-3 shrink-0 transition-colors",
                        isActive ? "text-[#dc2626]" : "text-gray-500 group-hover:text-gray-700"
                      )} />
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 shrink-0 bg-[#0c0c0e]">
          <div className="flex items-center mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-lg font-bold text-gray-900 shadow-lg shadow-red-900/20">
              S
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Saggin Planning</p>
              <p className="text-xs text-gray-500">Portale Ufficio</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center justify-center w-full px-4 py-2.5 mt-2 text-sm font-bold bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/20 rounded-xl hover:bg-[#dc2626] hover:text-gray-900 transition-all shadow-sm">
            <LogOut className="h-4 w-4 mr-3" />
            Esci
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200 md:hidden shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900 p-1 -ml-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-3 font-semibold text-gray-900 flex items-center gap-2">
              <div className="bg-white p-1 rounded-md shrink-0">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              Saggin Planning
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-full text-zinc-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
