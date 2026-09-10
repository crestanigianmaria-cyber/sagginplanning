import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Settings, Anchor, Ruler, AlertTriangle } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function VehicleDetailPage({ params }: any) {
  const { id } = await params;
  
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      configurations: true,
      craneCapacityCurves: { include: { points: { orderBy: { radiusMeters: 'asc' } } } }
    }
  });

  if (!vehicle) return notFound();

  const typeLabel: Record<string, string> = {
    MOTRICE_CON_GRU: 'Motrice con Gru',
    MOTRICE_SENZA_GRU: 'Motrice senza Gru',
    RIMORCHIO: 'Rimorchio',
    MOTOCARRO: 'Motocarro',
  };

  const statusColor: Record<string, string> = {
    DISPONIBILE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    MANUTENZIONE: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    FUORI_SERVIZIO: 'bg-red-500/10 text-red-700 border-red-500/20',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 md:p-6">
          <Link href="/vehicles" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{vehicle.name}</h1>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 mt-1 border border-slate-200 uppercase tracking-wider">
              {vehicle.licensePlate}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${statusColor[vehicle.status] || ''}`}>
          {vehicle.status.replace('_', ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Specifiche */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <Settings className="h-5 w-5 text-rose-900" />
              <h2 className="text-lg font-semibold">Specifiche Tecniche</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm text-slate-500">Tipologia</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{typeLabel[vehicle.type] || vehicle.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Portata Utile</dt>
                  <dd className="mt-1 text-lg font-semibold text-rose-900">{vehicle.payloadCapacity.toLocaleString()} kg</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Tara</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{vehicle.tare.toLocaleString()} kg</dd>
                </div>
                {vehicle.towableLoad && (
                  <div>
                    <dt className="text-sm text-slate-500">Portata Trainabile</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{vehicle.towableLoad.toLocaleString()} kg</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Dimensioni */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-rose-900" />
              <h2 className="text-lg font-semibold">Dimensioni</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-5 md:p-6 text-center mb-6">
                {vehicle.internalBedLength && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Lunghezza cassone</div>
                    <div className="text-xl font-semibold">{vehicle.internalBedLength}m</div>
                  </div>
                )}
                {vehicle.internalBedWidth && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Larghezza cassone</div>
                    <div className="text-xl font-semibold">{vehicle.internalBedWidth}m</div>
                  </div>
                )}
                {vehicle.bedHeightFromGround && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Altezza piano</div>
                    <div className="text-xl font-semibold">{vehicle.bedHeightFromGround}m</div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-5 md:p-6 text-sm">
                {vehicle.maxTransportableLength && <div className="flex justify-between"><span className="text-slate-500">Max lun. trasportabile</span><span className="font-medium text-slate-900">{vehicle.maxTransportableLength}m</span></div>}
                {vehicle.maxTransportableHeight && <div className="flex justify-between"><span className="text-slate-500">Max alt. trasportabile</span><span className="font-medium text-slate-900">{vehicle.maxTransportableHeight}m</span></div>}
                {vehicle.maxRearOverhang && <div className="flex justify-between"><span className="text-slate-500">Max sporgenza post.</span><span className="font-medium text-slate-900">{vehicle.maxRearOverhang}m</span></div>}
                {vehicle.maxExternalWidth && <div className="flex justify-between"><span className="text-slate-500">Larghezza esterna</span><span className="font-medium text-slate-900">{vehicle.maxExternalWidth}m</span></div>}
              </div>
              {vehicle.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500 italic">
                  {vehicle.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonna Gru */}
        <div className="space-y-6">
          {vehicle.hasCrane ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center gap-2 bg-rose-900/5">
                <Anchor className="h-5 w-5 text-rose-900" />
                <h2 className="text-lg font-semibold text-rose-900">Gru</h2>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-1">Modello</div>
                  <div className="text-lg font-semibold">{vehicle.craneModel || 'N/D'}</div>
                </div>
                {vehicle.craneMaxReach && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-1">Sbraccio massimo</div>
                    <div className="text-lg font-semibold text-rose-900">{vehicle.craneMaxReach}m</div>
                  </div>
                )}
                {vehicle.craneSide && (
                  <div className="mb-6">
                    <div className="text-xs text-slate-500 mb-1">Posizionamento</div>
                    <div className="font-medium capitalize">{vehicle.craneSide}</div>
                  </div>
                )}
                {vehicle.craneCapacityCurves.length > 0 && (
                  <>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tabella di carico</h3>
                    {vehicle.craneCapacityCurves[0].points.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-slate-500 text-xs">Raggio</th>
                              <th className="px-3 py-2 text-right font-semibold text-slate-500 text-xs">Capacità</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {vehicle.craneCapacityCurves[0].points.map((p) => (
                              <tr key={p.id}>
                                <td className="px-3 py-2 font-medium text-slate-700">{p.radiusMeters}m</td>
                                <td className="px-3 py-2 text-right font-semibold text-rose-900">{p.capacityKg.toLocaleString()} kg</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
              <Anchor className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="font-medium text-slate-500">Nessuna gru installata</p>
            </div>
          )}

          {/* Configurazioni */}
          {vehicle.configurations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-200">
                <h2 className="font-semibold text-slate-700">Configurazioni</h2>
              </div>
              <div className="divide-y divide-zinc-800">
                {vehicle.configurations.map(c => (
                  <div key={c.id} className="p-5 md:p-6">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      {c.isDefault && <span className="text-[10px] bg-rose-900/20 text-rose-900 px-2 py-0.5 rounded font-semibold">DEFAULT</span>}
                    </div>
                    <div className="text-xs text-slate-500">Portata: {c.payloadCapacity.toLocaleString()} kg · Tara: {c.tare.toLocaleString()} kg</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
