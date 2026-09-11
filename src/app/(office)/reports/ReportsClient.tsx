'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  Truck, 
  Users, 
  Clock, 
  Building2, 
  TrendingUp, 
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import { cn, getDriverAvatar } from '@/lib/utils';

export default function ReportsClient() {
  const [period, setPeriod] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_WEEK' | 'CUSTOM'>('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'DRIVERS' | 'CLIENTS' | 'VEHICLES'>('DRIVERS');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize dates
  useEffect(() => {
    const now = new Date();
    if (period === 'THIS_MONTH') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (period === 'LAST_MONTH') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (period === 'THIS_WEEK') {
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(sunday.toISOString().split('T')[0]);
    }
  }, [period]);

  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  // Export to CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = '﻿'; // UTF-8 BOM
    let fileName = `Saggin_Report_${startDate}_${endDate}.csv`;

    if (activeTab === 'DRIVERS') {
      csvContent += 'Autista;Mezzo Predefinito;Corse Totali;Corse Completate;Ore Guida/Viaggio;Ore Manuali Approvate;Ore Gru;Totale Ore Lavorate\n';
      data.driverStats.forEach((d: any) => {
        const tripH = (d.tripMinutes / 60).toFixed(1).replace('.', ',');
        const manH = (d.approvedManualMinutes / 60).toFixed(1).replace('.', ',');
        const craneH = (d.craneHours || 0).toString().replace('.', ',');
        const totalH = (d.totalWorkedMinutes / 60).toFixed(1).replace('.', ',');
        csvContent += `"${d.driverName}";"${d.defaultVehicle}";${d.totalTrips};${d.completedTrips};${tripH};${manH};${craneH};${totalH}\n`;
      });
      fileName = `Saggin_Ore_Autisti_${startDate}_${endDate}.csv`;
    } else if (activeTab === 'CLIENTS') {
      csvContent += 'Cliente / Committente;Corse Totali;Corse Completate;Ore Gru Totali;Peso Totale (kg);Cantieri Serviti\n';
      data.clientStats.forEach((c: any) => {
        const craneH = (c.craneHours || 0).toString().replace('.', ',');
        csvContent += `"${c.name}";${c.tripsCount};${c.completedCount};${craneH};${c.totalWeightKg};${c.destinationsCount}\n`;
      });
      fileName = `Saggin_Clienti_${startDate}_${endDate}.csv`;
    } else if (activeTab === 'VEHICLES') {
      csvContent += 'Mezzo;Targa;Tipologia;Con Gru;Corse Assegnate;Corse con Gru;Km Stimati\n';
      data.vehicleStats.forEach((v: any) => {
        csvContent += `"${v.vehicleName}";"${v.licensePlate}";"${v.type}";"${v.hasCrane ? 'SÌ' : 'NO'}";${v.tripsCount};${v.craneTripsCount};${v.estimatedTotalKm}\n`;
      });
      fileName = `Saggin_Flotta_${startDate}_${endDate}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col space-y-4 font-sans relative min-h-0">
      
      {/* Top Controls Bar */}
      <div className="bg-[var(--color-saggin-surface)] px-4 py-3 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-3 print:hidden">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-lg border border-red-200">
            <BarChart3 className="h-5 w-5 text-[var(--color-brand-red)]" />
          </div>
          <div>
            <h1 className="text-base font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">
              Report & Statistiche
            </h1>
            <p className="text-[11px] text-[var(--color-saggin-text-secondary)] font-medium">
              Rendicontazione ore lavorate, cantieri clienti e utilizzo flotta
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-[var(--color-saggin-elevated)] p-1 rounded-xl border border-[var(--color-saggin-border)] text-xs font-bold">
            <button
              onClick={() => setPeriod('THIS_MONTH')}
              className={cn("px-2.5 py-1 rounded-lg transition-all", period === 'THIS_MONTH' ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs" : "text-slate-500 hover:text-slate-800")}
            >
              Questo Mese
            </button>
            <button
              onClick={() => setPeriod('LAST_MONTH')}
              className={cn("px-2.5 py-1 rounded-lg transition-all", period === 'LAST_MONTH' ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs" : "text-slate-500 hover:text-slate-800")}
            >
              Mese Scorso
            </button>
            <button
              onClick={() => setPeriod('THIS_WEEK')}
              className={cn("px-2.5 py-1 rounded-lg transition-all", period === 'THIS_WEEK' ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs" : "text-slate-500 hover:text-slate-800")}
            >
              Questa Settimana
            </button>
            <button
              onClick={() => setPeriod('CUSTOM')}
              className={cn("px-2.5 py-1 rounded-lg transition-all", period === 'CUSTOM' ? "bg-white text-[var(--color-saggin-text-primary)] shadow-2xs" : "text-slate-500 hover:text-slate-800")}
            >
              Personalizzato
            </button>
          </div>

          {period === 'CUSTOM' && (
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-saggin-border)] text-xs bg-white font-medium outline-none" 
              />
              <span className="text-slate-400 text-xs">-</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[var(--color-saggin-border)] text-xs bg-white font-medium outline-none" 
              />
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[var(--color-saggin-text-primary)] text-xs font-bold rounded-lg border border-[var(--color-saggin-border)] shadow-2xs transition-all active:scale-95"
            title="Esporta tabella corrente in file Excel (CSV)"
          >
            <Download size={14} className="text-emerald-600" />
            <span>Esporta Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95"
            title="Stampa scheda riassuntiva o salva in PDF"
          >
            <Printer size={14} />
            <span>Stampa / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-space text-red-600">SAGGIN TRASPORTI S.R.L.</h1>
            <p className="text-sm text-slate-600">Via Padre Roberto 80, 36055 Nove (VI)</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">Rendicontazione Operativa</h2>
            <p className="text-xs text-slate-500">Periodo: {startDate} - {endDate}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Corse Totali</span>
            <TrendingUp size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {data?.totals?.totalTrips || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {data?.totals?.completedTrips || 0} completate
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Ore Lavoro Totali</span>
            <Clock size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {data?.totals?.totalWorkedHours || 0}h
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Viaggi + Ore manuali approvate
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Ore Utilizzo Gru</span>
            <Truck size={14} className="text-[var(--color-brand-red)]" />
          </div>
          <div className="text-2xl font-bold font-space text-[var(--color-brand-red)]">
            {data?.totals?.totalCraneHours || 0}h
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Lavoro effettivo in cantiere
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Clienti Serviti</span>
            <Building2 size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-space text-[var(--color-saggin-text-primary)]">
            {data?.clientStats?.length || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Nel periodo selezionato
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[var(--color-saggin-surface)] p-1 rounded-xl border border-[var(--color-saggin-border)] flex items-center gap-1.5 w-fit print:hidden">
        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
            activeTab === 'DRIVERS' 
              ? "bg-[var(--color-brand-red)] text-white shadow-2xs" 
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Users size={14} />
          <span>Ore Autisti ({data?.driverStats?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
            activeTab === 'CLIENTS' 
              ? "bg-[var(--color-brand-red)] text-white shadow-2xs" 
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Building2 size={14} />
          <span>Clienti & Commesse ({data?.clientStats?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('VEHICLES')}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
            activeTab === 'VEHICLES' 
              ? "bg-[var(--color-brand-red)] text-white shadow-2xs" 
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Truck size={14} />
          <span>Flotta & Mezzi ({data?.vehicleStats?.length || 0})</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[var(--color-saggin-border)] shadow-xs overflow-auto">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-[var(--color-brand-red)]" />
            <p className="font-semibold text-sm">Elaborazione reportistica in corso...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ORE AUTISTI */}
            {activeTab === 'DRIVERS' && (
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] sticky top-0 z-10 text-xs font-bold text-slate-700 font-space uppercase tracking-wider">
                    <th className="p-3.5">Autista</th>
                    <th className="p-3.5">Mezzo Fisso</th>
                    <th className="p-3.5 text-center">Corse</th>
                    <th className="p-3.5 text-center">Ore Guida / Viaggio</th>
                    <th className="p-3.5 text-center">Ore Manuali Approvate</th>
                    <th className="p-3.5 text-center">Ore Gru</th>
                    <th className="p-3.5 text-right">Totale Ore Lavorate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-saggin-border)] text-xs">
                  {data?.driverStats?.map((d: any) => {
                    const avatar = getDriverAvatar(d.driverName, d.profilePicture);
                    const totalHours = (d.totalWorkedMinutes / 60).toFixed(1);
                    const tripHours = (d.tripMinutes / 60).toFixed(1);
                    const manualHours = (d.approvedManualMinutes / 60).toFixed(1);

                    return (
                      <tr key={d.driverId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          {avatar ? (
                            <img src={avatar} alt={d.driverName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                              {d.driverName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div>{d.driverName}</div>
                            {d.pendingManualMinutes > 0 && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                +{(d.pendingManualMinutes / 60).toFixed(1)}h in attesa approvazione
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">{d.defaultVehicle}</td>
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-slate-900">{d.completedTrips}</span>
                          <span className="text-slate-400"> / {d.totalTrips}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-medium">{tripHours}h</td>
                        <td className="p-3.5 text-center font-mono font-medium text-slate-600">
                          {d.approvedManualMinutes > 0 ? `${manualHours}h` : '--'}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-[var(--color-brand-red)]">
                          {d.craneHours > 0 ? `${d.craneHours}h` : '--'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-sm text-[var(--color-brand-red)]">
                          {totalHours}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* TAB 2: CLIENTI & CANTIERI */}
            {activeTab === 'CLIENTS' && (
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] sticky top-0 z-10 text-xs font-bold text-slate-700 font-space uppercase tracking-wider">
                    <th className="p-3.5">Cliente / Committente</th>
                    <th className="p-3.5 text-center">Corse Totali</th>
                    <th className="p-3.5 text-center">Corse Completate</th>
                    <th className="p-3.5 text-center">Ore Gru Utilizzate</th>
                    <th className="p-3.5 text-center">Peso Merce Trasportato</th>
                    <th className="p-3.5 text-right">Cantieri / Indirizzi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-saggin-border)] text-xs">
                  {data?.clientStats?.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3.5 text-center font-bold text-slate-900">{c.tripsCount}</td>
                      <td className="p-3.5 text-center text-emerald-700 font-semibold">{c.completedCount}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-[var(--color-brand-red)]">
                        {c.craneHours > 0 ? `${c.craneHours}h` : '--'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-medium">
                        {c.totalWeightKg > 0 ? `${c.totalWeightKg.toLocaleString('it-IT')} kg` : '--'}
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-600">
                        {c.destinationsCount} destinazioni
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 3: FLOTTA & MEZZI */}
            {activeTab === 'VEHICLES' && (
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] sticky top-0 z-10 text-xs font-bold text-slate-700 font-space uppercase tracking-wider">
                    <th className="p-3.5">Mezzo</th>
                    <th className="p-3.5">Targa</th>
                    <th className="p-3.5">Tipologia</th>
                    <th className="p-3.5 text-center">Dotato di Gru</th>
                    <th className="p-3.5 text-center">Corse Assegnate</th>
                    <th className="p-3.5 text-center">Corse con Gru</th>
                    <th className="p-3.5 text-right">Km Stimati da Sede Nove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-saggin-border)] text-xs">
                  {data?.vehicleStats?.map((v: any) => (
                    <tr key={v.vehicleId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <Truck size={14} className="text-slate-400" />
                        <span>{v.vehicleName}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-bold">{v.licensePlate}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{v.type.replace(/_/g, ' ')}</td>
                      <td className="p-3.5 text-center">
                        {v.hasCrane ? (
                          <span className="bg-red-50 text-[var(--color-brand-red)] px-2 py-0.5 rounded font-bold text-[10px] border border-red-200">
                            SÌ
                          </span>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-900">{v.tripsCount}</td>
                      <td className="p-3.5 text-center font-mono font-medium text-slate-700">{v.craneTripsCount}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {v.estimatedTotalKm > 0 ? `${v.estimatedTotalKm.toLocaleString('it-IT')} km` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

    </div>
  );
}
