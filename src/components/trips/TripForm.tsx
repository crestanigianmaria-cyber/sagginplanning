'use client';
import { useSession } from 'next-auth/react';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertTriangle, AlertOctagon, Save, X, Truck, Package, MapPin, User, FileText, Anchor } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TripForm({ 
  trip = null, 
  drivers = [], 
  vehicles = [], 
  onSave, 
  onCancel,
  defaultDriverId,
  defaultDate
}: any) {
  const { data: session } = useSession();
  const [officeUsers, setOfficeUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/office-users')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setOfficeUsers(d.data);
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    createdById: trip?.createdById || (session?.user as any)?.id || '',
    clientName: trip?.clientName || '',
    driverId: trip?.driverId || defaultDriverId || '',
    date: trip?.date ? trip.date.split('T')[0] : (defaultDate || ''),
    time: trip?.scheduledTime || '',
    vehicleId: trip?.vehicleId || '',
    hasCraneConfig: false,
    trailerId: trip?.trailerId || '',
    cargoDesc: trip?.cargoDescription || '',
    weightKg: trip?.cargoWeight?.toString() || '',
    lengthM: trip?.cargoLength?.toString() || '',
    widthM: trip?.cargoWidth?.toString() || '',
    heightM: trip?.cargoHeight?.toString() || '',
    pallets: trip?.palletCount?.toString() || '',
    needsCrane: trip?.needsCrane || false,
    craneRadiusM: trip?.craneWorkRadius?.toString() || '10',
    address: trip?.address || '',
    contactName: trip?.contactName || '',
    contactPhone: trip?.contactPhone || '',
    customerRef: trip?.clientOrderNumber || '',
    notes: trip?.notes || ''
  });

  const [safetyCheck, setSafetyCheck] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Mock debounced safety check
  useEffect(() => {
    const checkSafety = async () => {
      if (!formData.vehicleId || !formData.weightKg) {
        setSafetyCheck(null);
        return;
      }
      setIsChecking(true);
      
      // Simulate API call
      setTimeout(() => {
        const weight = parseInt(formData.weightKg || '0');
        const radius = parseInt(formData.craneRadiusM || '0');
        
        let status = 'OK';
        let msgs = [];
        
        if (weight > 24000) {
          status = 'DANGER';
          msgs.push({ type: 'danger', title: 'Sovrappeso', detail: 'Il peso supera la portata massima di 24.000kg' });
        } else if (weight > 20000) {
          status = 'WARNING';
          msgs.push({ type: 'warning', title: 'Carico Pesante', detail: 'Peso vicino al limite di portata. Consigliata attenzione.' });
        } else {
          msgs.push({ type: 'success', title: 'Peso OK', detail: 'Il peso è entro i limiti.' });
        }

        if (formData.needsCrane && radius > 15) {
          status = 'DANGER';
          msgs.push({ type: 'danger', title: 'Gru - Fuori Limite', detail: `La gru non supporta il raggio di ${radius}m per questo peso.` });
        } else if (formData.needsCrane) {
          msgs.push({ type: 'success', title: 'Gru OK', detail: 'Capacità di sollevamento adeguata.' });
        }

        setSafetyCheck({ status, messages: msgs });
        setIsChecking(false);
      }, 500);
    };

    const timer = setTimeout(checkSafety, 600);
    return () => clearTimeout(timer);
  }, [formData.vehicleId, formData.weightKg, formData.craneRadiusM, formData.needsCrane]);

  
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    setIsSearchingAddress(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.warn('Mapbox token non configurato, uso Nominatim come fallback');
        // Fallback a Nominatim se non c'è il token Mapbox
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=it&limit=5`);
        const data = await res.json();
        setSuggestions(data.map((d: any) => ({
          display_name: d.display_name,
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon)
        })));
      } else {
        const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=${token}&country=it&limit=5`);
        const data = await res.json();
        if (res.ok && data.features) {
          setSuggestions(data.features.map((f: any) => ({
            display_name: f.properties.full_address || f.properties.name || f.properties.place_formatted || 'Indirizzo sconosciuto',
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0]
          })));
        } else {
          // Fallback a Nominatim se Mapbox fallisce (es. token non valido)
          console.warn('Mapbox ha restituito un errore, uso Nominatim come fallback');
          const fbRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=it&limit=5`);
          const fbData = await fbRes.json();
          setSuggestions(fbData.map((d: any) => ({
            display_name: d.display_name,
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon)
          })));
        }
      }
    } catch (e) {
      console.error('Errore geocoding:', e);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const selectAddress = async (suggestion: any) => {
    const lat = suggestion.lat;
    const lon = suggestion.lon;
    // Mapbox restituisce indirizzi più puliti di OSM, possiamo tenere il nome per intero o tagliare meno aggressivamente
    const addressName = suggestion.display_name; 

    setFormData(prev => ({ ...prev, address: addressName, latitude: lat, longitude: lon }));
    setSuggestions([]);

    // Calcola rotta da Sede Saggin Trasporti: Via Padre Roberto 80, 36055 Nove (VI)
    try {
      const SAGGIN_HQ_LAT = 45.71902;
      const SAGGIN_HQ_LON = 11.67734;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      let distMeters = 0;
      let durSecs = 0;

      // 1. Mapbox Directions API se token presente
      if (token) {
        try {
          const mbRes = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${SAGGIN_HQ_LON},${SAGGIN_HQ_LAT};${lon},${lat}?access_token=${token}&overview=false`);
          if (mbRes.ok) {
            const mbData = await mbRes.json();
            if (mbData.routes && mbData.routes.length > 0) {
              distMeters = mbData.routes[0].distance;
              durSecs = mbData.routes[0].duration;
            }
          }
        } catch (mbe) {
          console.warn('Mapbox directions fallback to OSRM:', mbe);
        }
      }

      // 2. Fallback su OSRM se Mapbox non disponibile
      if (!distMeters) {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${SAGGIN_HQ_LON},${SAGGIN_HQ_LAT};${lon},${lat}?overview=false`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          distMeters = data.routes[0].distance;
          durSecs = data.routes[0].duration;
        }
      }

      if (distMeters > 0) {
        setFormData(prev => ({
          ...prev,
          address: addressName,
          latitude: lat,
          longitude: lon,
          estimatedDistanceKm: Math.round(distMeters / 1000),
          estimatedDurationMins: Math.round(durSecs / 60)
        }));
      }
    } catch (e) {
      console.error('Errore calcolo percorso da sede Saggin:', e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (safetyCheck?.status === 'DANGER') {
      if (!window.confirm('Ci sono avvisi di sicurezza critici. Vuoi salvare comunque?')) {
        return;
      }
    }
    
    // Map formData to Prisma Trip model
    const payload = {
      createdById: formData.createdById || undefined,
      driverId: formData.driverId || null,
      date: new Date(formData.date).toISOString(),
      scheduledTime: formData.time,
      vehicleId: formData.vehicleId || null,
      trailerId: formData.trailerId || null,
      cargoDescription: formData.cargoDesc,
      cargoWeight: formData.weightKg ? parseInt(formData.weightKg) : null,
      cargoLength: formData.lengthM ? parseFloat(formData.lengthM) : null,
      cargoWidth: formData.widthM ? parseFloat(formData.widthM) : null,
      cargoHeight: formData.heightM ? parseFloat(formData.heightM) : null,
      palletCount: formData.pallets ? parseInt(formData.pallets) : null,
      needsCrane: formData.needsCrane,
      craneWorkRadius: formData.craneRadiusM ? parseFloat(formData.craneRadiusM) : null,
      clientName: formData.clientName || null,
      address: formData.address,
      contactName: formData.contactName || null,
      contactPhone: formData.contactPhone || null,
      clientOrderNumber: formData.customerRef || null,
      notes: formData.notes || null,
      estimatedDistanceKm: (formData as any).estimatedDistanceKm ? parseFloat((formData as any).estimatedDistanceKm as string) : null,
      estimatedDurationMins: (formData as any).estimatedDurationMins ? parseInt((formData as any).estimatedDurationMins as string) : null,
    };
    
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full">
      {/* Form Fields */}
      <div className="flex-1 p-6 overflow-y-auto space-y-8">
        <div className="pb-2 border-b border-[var(--color-saggin-border)]/50">
          <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-saggin-text-secondary)]">Parametri di trasporto e carico</p>
        </div>

        {/* Sezione 1: Assegnazione */}
        <section className="bg-[var(--color-saggin-surface)] p-5 md:p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
            <User className="h-5 w-5" />
            <h3 className="font-semibold">Assegnazione</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Creato / Registrato da</label>
              <select 
                name="createdById" 
                value={formData.createdById} 
                onChange={handleChange} 
                className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 border outline-none"
              >
                <option value="">Seleziona chi crea...</option>
                {officeUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Autista (Opzionale)</label>
              <select name="driverId" value={formData.driverId} onChange={handleChange} className="w-full rounded-lg border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)]  focus:border-[var(--color-brand-red)] focus:ring-[#dc2626] text-sm py-2 px-3 border">
  <option value="">Da Assegnare</option>
  {drivers?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
</select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Data *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full rounded-lg border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)]   focus:border-[var(--color-brand-red)] focus:ring-[#dc2626] text-sm py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Orario previsto *</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full rounded-lg border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)]   focus:border-[var(--color-brand-red)] focus:ring-[#dc2626] text-sm py-2 px-3 border" />
            </div>
          </div>
        </section>

        {/* Sezione 2: Mezzo */}
        <section className="bg-[var(--color-saggin-surface)] p-4 md:p-5 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center gap-2 mb-3 text-[var(--color-brand-red)]">
            <Truck className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Mezzo e Allestimento</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Veicolo Trattore *</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none">
                <option value="">Da Assegnare</option>
                {vehicles?.filter((v:any) => v.type !== 'RIMORCHIO').map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Rimorchio (Opzionale)</label>
              <select name="trailerId" value={formData.trailerId} onChange={handleChange} className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none">
                <option value="">Nessuno</option>
                {vehicles?.filter((v:any) => v.type === 'RIMORCHIO').map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Sezione 3: Carico */}
        <section className="bg-[var(--color-saggin-surface)] p-4 md:p-5 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center gap-2 mb-3 text-[var(--color-brand-red)]">
            <Package className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Dettagli Carico</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Descrizione Merce *</label>
              <input type="text" name="cargoDesc" value={formData.cargoDesc} onChange={handleChange} required placeholder="Es. Macchinari industriali, tubazioni..." className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Peso stimato (kg)</label>
                <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} placeholder="0" className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Lung. (m)</label>
                <input type="number" step="0.1" name="lengthM" value={formData.lengthM} onChange={handleChange} placeholder="0.0" className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Larg. (m)</label>
                <input type="number" step="0.1" name="widthM" value={formData.widthM} onChange={handleChange} placeholder="0.0" className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Alt. (m)</label>
                <input type="number" step="0.1" name="heightM" value={formData.heightM} onChange={handleChange} placeholder="0.0" className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 outline-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Sezione 4: Gru */}
        <section className="bg-[var(--color-saggin-surface)] p-5 md:p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
            <Anchor className="h-5 w-5" />
            <h3 className="font-semibold">Operazioni con Gru</h3>
          </div>
          <div className="flex items-center mb-4">
            <input type="checkbox" id="needsCrane" name="needsCrane" checked={formData.needsCrane} onChange={handleChange} className="h-4 w-4 text-[var(--color-brand-red)] focus:ring-[#dc2626] border-[var(--color-saggin-border)] rounded" />
            <label htmlFor="needsCrane" className="ml-2 block text-sm text-[var(--color-saggin-text-primary)] font-medium">
              Richiede l'utilizzo della gru
            </label>
          </div>
          {formData.needsCrane && (
            <div className="mt-4 p-5 md:p-6 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl">
              <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-2">Raggio di lavoro stimato (Metri): {formData.craneRadiusM}m</label>
              <input type="range" name="craneRadiusM" min="1" max="30" value={formData.craneRadiusM} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-[#dc2626]" />
              <div className="flex justify-between text-xs text-[var(--color-saggin-text-secondary)] mt-1">
                <span>1m</span>
                <span>15m</span>
                <span>30m</span>
              </div>
            </div>
          )}
        </section>

        {/* Sezione 5: Destinazione e Mappe */}
        <section className="bg-[var(--color-saggin-surface)] p-5 md:p-6 rounded-xl border border-[var(--color-saggin-border)] relative">
          <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Destinazione e Percorso</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Indirizzo di Consegna (Ricerca Automatica) *</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={(e) => {
                    handleChange(e);
                    searchAddress(e.target.value);
                  }} 
                  placeholder="Inizia a digitare l'indirizzo (es. Via Roma 1, Padova)..."
                  required 
                  className="w-full rounded-lg border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)]  focus:border-[var(--color-brand-red)] focus:ring-[#dc2626] text-sm py-2 px-3 border pr-10" 
                  autoComplete="off"
                />
                {isSearchingAddress && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-[var(--color-brand-red)] border-t-transparent rounded-full"></div>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-lg  max-h-60 overflow-auto">
                    {suggestions.map((s, i) => (
                      <li 
                        key={i} 
                        onClick={() => selectAddress(s)}
                        className="px-4 py-3 hover:bg-[var(--color-saggin-bg)] cursor-pointer text-sm text-[var(--color-saggin-text-primary)] border-b border-[var(--color-saggin-border)] last:border-0 transition-colors"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-[var(--color-brand-red)] shrink-0" />
                <span>Punto di partenza calcolo: <strong>Via Padre Roberto 80, 36055 Nove (VI)</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="bg-red-50 p-2 rounded-xl text-[var(--color-brand-red)] border border-red-200">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--color-saggin-text-secondary)] font-bold uppercase tracking-wider">Distanza dalla Sede</div>
                    <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                      {(formData as any).estimatedDistanceKm ? `${(formData as any).estimatedDistanceKm} km` : '--'}
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="bg-red-50 p-2 rounded-xl text-[var(--color-brand-red)] border border-red-200">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--color-saggin-text-secondary)] font-bold uppercase tracking-wider">Tempo di Viaggio</div>
                    <div className="text-base font-bold font-space text-[var(--color-saggin-text-primary)]">
                      {(formData as any).estimatedDurationMins ? `${(formData as any).estimatedDurationMins} min` : '--'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Nome Cliente / Destinatario</label>
                <input 
                  type="text" 
                  name="clientName" 
                  placeholder="Es. Impresa Edile Rossi Srl"
                  value={formData.clientName} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 border outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-saggin-text-secondary)] mb-1">Numero Impegno Cliente</label>
                <input 
                  type="text" 
                  name="customerRef" 
                  placeholder="Es. IMP-2026-089"
                  value={formData.customerRef} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 border outline-none font-mono" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Referente / Contatto in cantiere</label>
                <input type="text" name="contactName" placeholder="Es. Geom. Bianchi" value={formData.contactName} onChange={handleChange} className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 border outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Telefono Referente</label>
                <input type="text" name="contactPhone" placeholder="Es. +39 340 1234567" value={formData.contactPhone} onChange={handleChange} className="w-full rounded-xl border border-[var(--color-saggin-border)] bg-[var(--color-saggin-surface)] text-[var(--color-saggin-text-primary)] focus:border-[var(--color-brand-red)] text-sm py-2 px-3 border outline-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Sezione 6: Note */}
        <section className="bg-[var(--color-saggin-surface)] p-5 md:p-6 rounded-xl border border-[var(--color-saggin-border)]">
          <div className="flex items-center gap-2 mb-4 text-[var(--color-brand-red)]">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold">Note Aggiuntive</h3>
          </div>
          <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full rounded-lg border-[var(--color-saggin-border)]  focus:border-[var(--color-brand-red)] focus:ring-[#dc2626] text-sm py-2 px-3 border"></textarea>
        </section>
      </div>

      {/* Safety Check Sidebar */}
      <div className="w-full lg:w-80 bg-[var(--color-saggin-bg)]/50 border-t lg:border-t-0 lg:border-l border-[var(--color-saggin-border)] flex flex-col p-6 shrink-0">
        <h3 className="text-lg font-semibold text-[var(--color-brand-red)] flex items-center gap-2 mb-6">
          <ShieldCheck className="h-5 w-5" />
          Controllo Sicurezza
        </h3>

        <div className="flex-1 space-y-4">
          {!formData.vehicleId || !formData.weightKg ? (
            <div className="text-sm text-[var(--color-saggin-text-secondary)] text-center py-8">
              Inserisci mezzo e peso per abilitare i controlli di sicurezza in tempo reale.
            </div>
          ) : isChecking ? (
            <div className="text-sm text-[var(--color-saggin-text-secondary)] text-center py-8 animate-pulse">
              Analisi in corso...
            </div>
          ) : safetyCheck ? (
            <>
              {/* BARRA VISIVA RIEMPIMENTO PORTATA */}
              {(() => {
                const selectedVehicle = vehicles?.find((v: any) => v.id === formData.vehicleId);
                const maxPayload = selectedVehicle?.payloadCapacity || 0;
                const weight = parseInt(formData.weightKg || '0', 10);
                const pct = maxPayload > 0 ? Math.round((weight / maxPayload) * 100) : 0;
                const isOver = maxPayload > 0 && weight > maxPayload;
                const isWarning = pct > 80 && !isOver;

                return (
                  <div className="p-4 rounded-xl bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[var(--color-saggin-text-secondary)]">Portata Mezzo</span>
                      <span className={cn(
                        "font-bold font-space text-sm",
                        isOver ? "text-[var(--color-brand-red)]" :
                        isWarning ? "text-[var(--color-warning)]" :
                        "text-[var(--color-success)]"
                      )}>
                        {weight.toLocaleString('it-IT')} / {maxPayload.toLocaleString('it-IT')} kg ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-[var(--color-saggin-bg)] rounded-full h-3 overflow-hidden border border-[var(--color-saggin-border)]">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          isOver ? "bg-[var(--color-brand-red)]" :
                          isWarning ? "bg-[var(--color-warning)]" :
                          "bg-[var(--color-success)]"
                        )}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[var(--color-saggin-text-secondary)] pt-1">
                      <span>0 kg</span>
                      <span>80% soglia</span>
                      <span>Max {maxPayload.toLocaleString('it-IT')} kg</span>
                    </div>
                  </div>
                );
              })()}

              {/* Overall Status Dark Theme Badge */}
              <div className={cn(
                "p-4 rounded-xl border flex items-center gap-3",
                safetyCheck.status === 'OK' ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]" :
                safetyCheck.status === 'WARNING' ? "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]" :
                "bg-[var(--color-brand-red)]/10 border-[var(--color-brand-red)]/30 text-[var(--color-brand-red)]"
              )}>
                {safetyCheck.status === 'OK' ? <ShieldCheck className="h-7 w-7 shrink-0 text-[var(--color-success)]" /> :
                 safetyCheck.status === 'WARNING' ? <AlertTriangle className="h-7 w-7 shrink-0 text-[var(--color-warning)]" /> :
                 <AlertOctagon className="h-7 w-7 shrink-0 text-[var(--color-brand-red)]" />}
                <div>
                  <div className="font-bold text-sm">
                    {safetyCheck.status === 'OK' ? 'Carico Idoneo' :
                     safetyCheck.status === 'WARNING' ? 'Attenzione: Carico Elevato' : 'Carico Non Idoneo (Pericolo)'}
                  </div>
                  <div className="text-xs opacity-80">Controllo incrociato peso e sagoma</div>
                </div>
              </div>

              {/* Individual Checks */}
              <div className="space-y-3 mt-6">
                <h4 className="text-xs font-semibold text-[var(--color-saggin-text-secondary)] uppercase tracking-wider mb-2">Dettaglio Controlli</h4>
                {safetyCheck.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={cn(
                    "p-3 rounded-xl border text-xs",
                    msg.type === 'success' ? "border-[var(--color-success)]/20 bg-[var(--color-success)]/5 text-[var(--color-success)]" :
                    msg.type === 'warning' ? "border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 text-[var(--color-warning)]" :
                    "border-[var(--color-brand-red)]/20 bg-[var(--color-brand-red)]/5 text-[var(--color-brand-red)]"
                  )}>
                    <div className="font-bold mb-0.5">{msg.title}</div>
                    <div className="text-[var(--color-saggin-text-secondary)]">{msg.detail}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[var(--color-saggin-border)] mt-6 flex flex-col gap-3">
          <button
            type="submit"
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors ",
              safetyCheck?.status === 'DANGER' 
                ? "bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white" 
                : "bg-[var(--color-brand-red)] hover:bg-[#b91c1c] text-white"
            )}
          >
            <Save className="h-5 w-5" />
            Salva Viaggio
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl font-medium text-[var(--color-saggin-text-secondary)] hover:bg-[var(--color-saggin-bg)] flex justify-center items-center gap-2 transition-colors"
          >
            <X className="h-5 w-5" />
            Annulla
          </button>
        </div>
      </div>
    </form>
  );
}
