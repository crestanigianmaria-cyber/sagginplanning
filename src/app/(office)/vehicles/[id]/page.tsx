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
    DISPONIBILE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MANUTENZIONE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FUORI_SERVIZIO: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vehicles" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{vehicle.name}</h1>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-800 text-zinc-300 mt-1 border border-zinc-700 uppercase tracking-wider">
              {vehicle.licensePlate}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor[vehicle.status] || ''}`}>
          {vehicle.status.replace('_', ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Specifiche */}
          <div className="bg-[#111113] rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#dc2626]" />
              <h2 className="text-lg font-bold">Specifiche Tecniche</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <dt className="text-sm text-zinc-500">Tipologia</dt>
                  <dd className="mt-1 font-semibold text-zinc-200">{typeLabel[vehicle.type] || vehicle.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Portata Utile</dt>
                  <dd className="mt-1 text-lg font-bold text-[#dc2626]">{vehicle.payloadCapacity.toLocaleString()} kg</dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500">Tara</dt>
                  <dd className="mt-1 font-semibold text-zinc-200">{vehicle.tare.toLocaleString()} kg</dd>
                </div>
                {vehicle.towableLoad && (
                  <div>
                    <dt className="text-sm text-zinc-500">Portata Trainabile</dt>
                    <dd className="mt-1 font-semibold text-zinc-200">{vehicle.towableLoad.toLocaleString()} kg</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Dimensioni */}
          <div className="bg-[#111113] rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-[#dc2626]" />
              <h2 className="text-lg font-bold">Dimensioni</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                {vehicle.internalBedLength && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Lunghezza cassone</div>
                    <div className="text-xl font-bold">{vehicle.internalBedLength}m</div>
                  </div>
                )}
                {vehicle.internalBedWidth && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Larghezza cassone</div>
                    <div className="text-xl font-bold">{vehicle.internalBedWidth}m</div>
                  </div>
                )}
                {vehicle.bedHeightFromGround && (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Altezza piano</div>
                    <div className="text-xl font-bold">{vehicle.bedHeightFromGround}m</div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {vehicle.maxTransportableLength && <div className="flex justify-between"><span className="text-zinc-500">Max lun. trasportabile</span><span className="font-medium text-zinc-200">{vehicle.maxTransportableLength}m</span></div>}
                {vehicle.maxTransportableHeight && <div className="flex justify-between"><span className="text-zinc-500">Max alt. trasportabile</span><span className="font-medium text-zinc-200">{vehicle.maxTransportableHeight}m</span></div>}
                {vehicle.maxRearOverhang && <div className="flex justify-between"><span className="text-zinc-500">Max sporgenza post.</span><span className="font-medium text-zinc-200">{vehicle.maxRearOverhang}m</span></div>}
                {vehicle.maxExternalWidth && <div className="flex justify-between"><span className="text-zinc-500">Larghezza esterna</span><span className="font-medium text-zinc-200">{vehicle.maxExternalWidth}m</span></div>}
              </div>
              {vehicle.notes && (
                <div className="mt-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm text-zinc-400 italic">
                  {vehicle.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonna Gru */}
        <div className="space-y-6">
          {vehicle.hasCrane ? (
            <div className="bg-[#111113] rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800 flex items-center gap-2 bg-[#dc2626]/5">
                <Anchor className="h-5 w-5 text-[#dc2626]" />
                <h2 className="text-lg font-bold text-[#dc2626]">Gru</h2>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <div className="text-xs text-zinc-500 mb-1">Modello</div>
                  <div className="text-lg font-bold">{vehicle.craneModel || 'N/D'}</div>
                </div>
                {vehicle.craneMaxReach && (
                  <div className="mb-4">
                    <div className="text-xs text-zinc-500 mb-1">Sbraccio massimo</div>
                    <div className="text-lg font-bold text-[#dc2626]">{vehicle.craneMaxReach}m</div>
                  </div>
                )}
                {vehicle.craneSide && (
                  <div className="mb-6">
                    <div className="text-xs text-zinc-500 mb-1">Posizionamento</div>
                    <div className="font-medium capitalize">{vehicle.craneSide}</div>
                  </div>
                )}
                {vehicle.craneCapacityCurves.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Tabella di carico</h3>
                    {vehicle.craneCapacityCurves[0].points.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-zinc-800">
                        <table className="min-w-full text-sm">
                          <thead className="bg-zinc-950">
                            <tr>
                              <th className="px-3 py-2 text-left font-bold text-zinc-500 text-xs">Raggio</th>
                              <th className="px-3 py-2 text-right font-bold text-zinc-500 text-xs">Capacità</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {vehicle.craneCapacityCurves[0].points.map((p) => (
                              <tr key={p.id}>
                                <td className="px-3 py-2 font-medium text-zinc-300">{p.radiusMeters}m</td>
                                <td className="px-3 py-2 text-right font-bold text-[#dc2626]">{p.capacityKg.toLocaleString()} kg</td>
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
            <div className="bg-[#111113] rounded-2xl border-2 border-dashed border-zinc-800 p-8 text-center">
              <Anchor className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="font-medium text-zinc-600">Nessuna gru installata</p>
            </div>
          )}

          {/* Configurazioni */}
          {vehicle.configurations.length > 0 && (
            <div className="bg-[#111113] rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="font-bold text-zinc-300">Configurazioni</h2>
              </div>
              <div className="divide-y divide-zinc-800">
                {vehicle.configurations.map(c => (
                  <div key={c.id} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-zinc-200">{c.name}</span>
                      {c.isDefault && <span className="text-[10px] bg-[#dc2626]/20 text-[#dc2626] px-2 py-0.5 rounded font-bold">DEFAULT</span>}
                    </div>
                    <div className="text-xs text-zinc-500">Portata: {c.payloadCapacity.toLocaleString()} kg · Tara: {c.tare.toLocaleString()} kg</div>
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
