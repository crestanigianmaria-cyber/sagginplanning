'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Building2, 
  Navigation, 
  RefreshCw, 
  Clock, 
  Phone, 
  User, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Crosshair
} from 'lucide-react';
import { cn, getDriverAvatar } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';

export default function FleetMapClient() {
  const [data, setData] = useState<{ depot: any; drivers: any[]; tripsToday: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'IN_VIAGGIO' | 'DISPONIBILE'>('ALL');

  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const fetchFleetData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/fleet/live');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Error fetching fleet data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted) return;

      const mapContainer = document.getElementById('fleet-map-container');
      if (!mapContainer) return;

      // Initialize map if not already done
      if (!mapRef.current) {
        const defaultCenter = [45.71902, 11.67734]; // Nove (VI)
        const map = L.map('fleet-map-container', {
          center: defaultCenter as any,
          zoom: 12,
          zoomControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;
      if (!map) return;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      if (!data) return;

      // 1. Marker Sede Saggin
      const depotIcon = L.divIcon({
        className: 'custom-depot-marker',
        html: `
          <div style="background-color: #E31E24; color: white; border-radius: 12px; padding: 6px; box-shadow: 0 4px 12px rgba(227,30,36,0.4); border: 2px solid white; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const depotMarker = L.marker([data.depot.lat, data.depot.lng], { icon: depotIcon }).addTo(map);
      depotMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-weight: bold; color: #E31E24; font-size: 13px;">${data.depot.name}</h4>
          <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${data.depot.address}</p>
          <span style="display: inline-block; margin-top: 6px; background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">PUNTO DI PARTENZA FLOTTA</span>
        </div>
      `);
      markersRef.current['depot'] = depotMarker;

      // 2. Markers Autisti
      data.drivers.forEach((driver) => {
        if (!driver.position?.lat || !driver.position?.lng) return;

        const isMoving = driver.status === 'IN_VIAGGIO';
        const avatar = getDriverAvatar(driver.name, driver.profilePicture);

        const driverIcon = L.divIcon({
          className: 'custom-driver-marker',
          html: `
            <div style="position: relative; cursor: pointer;">
              <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; border: 3px solid ${isMoving ? '#16A34A' : '#E31E24'}; box-shadow: 0 4px 10px rgba(0,0,0,0.25); background: white;">
                ${avatar ? `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; background: #0F172A; color: white;">${driver.name.charAt(0)}</div>`}
              </div>
              <div style="position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; background: ${isMoving ? '#16A34A' : '#F59E0B'}; border: 2px solid white;"></div>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          popupAnchor: [0, -22]
        });

        const driverMarker = L.marker([driver.position.lat, driver.position.lng], { icon: driverIcon }).addTo(map);
        
        driverMarker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <strong style="font-size: 13px; color: #0F172A;">${driver.name}</strong>
              <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${isMoving ? '#dcfce7; color: #166534;' : '#fef3c7; color: #92400e;'}">
                ${isMoving ? 'IN CORSA' : 'FERMO / DISPONIBILE'}
              </span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
              Camion: <strong style="color: #334155;">${driver.defaultVehicle?.name || 'Non assegnato'}</strong>
            </div>
            ${driver.currentTrip ? `
              <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
                <div style="font-size: 11px; font-weight: bold; color: #E31E24;">Destinazione Attuale:</div>
                <div style="font-size: 11px; color: #1e293b; font-weight: 600;">${driver.currentTrip.clientName || driver.currentTrip.cargoDescription}</div>
                <div style="font-size: 10px; color: #64748b;">${driver.currentTrip.address}</div>
              </div>
            ` : '<div style="font-size: 11px; color: #94a3b8; font-style: italic;">Nessuna corsa attiva al momento</div>'}
          </div>
        `);

        markersRef.current[`driver-${driver.id}`] = driverMarker;
      });

      // 3. Markers Cantieri / Viaggi di oggi
      data.tripsToday.forEach((trip) => {
        if (!trip.latitude || !trip.longitude) return;

        const isCompleted = trip.status === 'COMPLETATO';
        const isWorking = trip.status === 'IN_CORSO';

        const color = isCompleted ? '#16A34A' : (isWorking ? '#D97706' : '#2563EB');

        const tripIcon = L.divIcon({
          className: 'custom-trip-marker',
          html: `
            <div style="background-color: ${color}; color: white; border-radius: 8px; padding: 4px 6px; font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid white; white-space: nowrap;">
              <span>📍 ${trip.scheduledTime || ''}</span>
            </div>
          `,
          iconSize: [60, 26],
          iconAnchor: [30, 13]
        });

        const tripMarker = L.marker([trip.latitude, trip.longitude], { icon: tripIcon }).addTo(map);
        tripMarker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: ${color}; margin-bottom: 2px;">
              ${trip.status} • ORE ${trip.scheduledTime}
            </div>
            <strong style="font-size: 12px; color: #0F172A; display: block;">${trip.clientName || trip.cargoDescription}</strong>
            <p style="font-size: 11px; color: #475569; margin: 2px 0 6px;">${trip.address}</p>
            <div style="font-size: 10px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              Autista: <strong style="color: #0F172A;">${trip.driver?.name || 'Da assegnare'}</strong>
            </div>
          </div>
        `);

        markersRef.current[`trip-${trip.id}`] = tripMarker;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [data]);

  const centerOnDriver = (driver: any) => {
    setSelectedDriverId(driver.id);
    if (mapRef.current && driver.position?.lat && driver.position?.lng) {
      mapRef.current.flyTo([driver.position.lat, driver.position.lng], 15, {
        duration: 1.2
      });
      const marker = markersRef.current[`driver-${driver.id}`];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const centerOnDepot = () => {
    setSelectedDriverId(null);
    if (mapRef.current && data?.depot) {
      mapRef.current.flyTo([data.depot.lat, data.depot.lng], 13, {
        duration: 1
      });
      markersRef.current['depot']?.openPopup();
    }
  };

  const filteredDrivers = data?.drivers.filter(d => {
    if (filter === 'IN_VIAGGIO') return d.status === 'IN_VIAGGIO';
    if (filter === 'DISPONIBILE') return d.status !== 'IN_VIAGGIO';
    return true;
  }) || [];

  return (
    <div className="h-full flex flex-col space-y-3 font-sans relative min-h-0">
      
      {/* Top Header Controls */}
      <div className="bg-[var(--color-saggin-surface)] px-4 py-2.5 rounded-xl border border-[var(--color-saggin-border)] shadow-2xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 text-[var(--color-brand-red)] rounded-lg border border-red-200">
            <Navigation className="h-5 w-5 text-[var(--color-brand-red)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-space text-[var(--color-saggin-text-primary)] leading-tight">
                Mappa Flotta Live
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-saggin-text-secondary)] font-medium">
              Monitoraggio veicoli e cantieri in tempo reale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={centerOnDepot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-saggin-elevated)] hover:bg-slate-200 text-[var(--color-saggin-text-primary)] text-xs font-bold rounded-lg border border-[var(--color-saggin-border)] transition-all shadow-2xs"
            title="Centra mappa sulla sede di Nove (VI)"
          >
            <Crosshair size={14} className="text-[var(--color-brand-red)]" />
            <span>Sede Nove (VI)</span>
          </button>

          <button
            onClick={fetchFleetData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
            <span>Aggiorna</span>
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">
        
        {/* Left / Bottom Panel: Driver Fleet List */}
        <div className="w-full lg:w-84 xl:w-92 bg-[var(--color-saggin-surface)] rounded-2xl border border-[var(--color-saggin-border)] shadow-xs flex flex-col shrink-0 overflow-hidden">
          <div className="p-3.5 border-b border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs font-space text-[var(--color-saggin-text-primary)] uppercase tracking-wider">
                Stato Autisti ({data?.drivers.length || 0})
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Clicca per localizzare sulla mappa</p>
            </div>

            {/* Filter */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[var(--color-saggin-border)] text-[10px] font-bold">
              <button
                onClick={() => setFilter('ALL')}
                className={cn("px-2 py-0.5 rounded", filter === 'ALL' ? "bg-[var(--color-brand-red)] text-white" : "text-slate-600")}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilter('IN_VIAGGIO')}
                className={cn("px-2 py-0.5 rounded", filter === 'IN_VIAGGIO' ? "bg-[var(--color-brand-red)] text-white" : "text-slate-600")}
              >
                In Corsa
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                Caricamento posizioni flotta...
              </div>
            ) : filteredDrivers.map((driver) => {
              const isSelected = selectedDriverId === driver.id;
              const isMoving = driver.status === 'IN_VIAGGIO';
              const avatar = getDriverAvatar(driver.name, driver.profilePicture);

              return (
                <div
                  key={driver.id}
                  onClick={() => centerOnDriver(driver)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer shadow-2xs relative",
                    isSelected 
                      ? "border-[var(--color-brand-red)] bg-red-50/20 ring-1 ring-[var(--color-brand-red)]" 
                      : "border-[var(--color-saggin-border)] hover:border-slate-400 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={driver.name} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs font-space text-[var(--color-saggin-text-primary)]">
                          {driver.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Truck size={10} className="text-slate-400" />
                          <span>{driver.defaultVehicle?.name || 'Senza mezzo'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider",
                      isMoving 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse" 
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    )}>
                      {isMoving ? 'In Corsa' : 'Fermo'}
                    </span>
                  </div>

                  {driver.currentTrip ? (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] space-y-0.5">
                      <div className="font-semibold text-slate-800 truncate">
                        {driver.currentTrip.clientName || driver.currentTrip.cargoDescription}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin size={10} className="text-[var(--color-brand-red)] shrink-0" />
                        <span>{driver.currentTrip.address}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
                      Nessuna corsa assegnata ora
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Depot Card */}
          <div className="p-3 border-t border-[var(--color-saggin-border)] bg-[var(--color-saggin-elevated)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 text-[var(--color-brand-red)]">
                <Building2 size={14} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Sede Saggin Nove</div>
                <div className="text-[10px] text-slate-500">Via Padre Roberto 80 (VI)</div>
              </div>
            </div>
            <button
              onClick={centerOnDepot}
              className="text-[10px] font-bold text-[var(--color-brand-red)] hover:underline"
            >
              Vedi &rarr;
            </button>
          </div>
        </div>

        {/* Right / Main Area: Interactive Leaflet Map Container */}
        <div className="flex-1 bg-white rounded-2xl border border-[var(--color-saggin-border)] shadow-xs relative overflow-hidden min-h-[400px]">
          <div id="fleet-map-container" className="w-full h-full z-10" />

          {/* Map Overlay Legend in Top Right */}
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-sm text-[10px] font-medium space-y-1.5">
            <div className="font-bold text-slate-800 text-[11px] mb-1">Legenda Mappa</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--color-brand-red)] border border-white" />
              <span>Sede Centrale Nove (VI)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span>Autista in movimento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
              <span>Cantieri del giorno</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
