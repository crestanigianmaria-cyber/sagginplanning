import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(driver)/my-trips/[id]/page.tsx'
with open(path, 'r') as f:
    content = f.read()

old_notes_block = """            {/* NOTE AUTISTA INSERITE (A FINE LAVORO) */}
            {trip.status === 'COMPLETATO' && trip.driverNotes && (
              <div className="mt-4 p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="text-xs text-emerald-500/80 font-bold uppercase tracking-wider mb-2 pl-2">Le tue note:</div>
                <div className="text-emerald-100 pl-2 text-lg italic">{trip.driverNotes}</div>
              </div>
            )}"""

new_summary_block = """            {/* RIEPILOGO LAVORO (A FINE LAVORO) */}
            {trip.status === 'COMPLETATO' && (
              <div className="mt-6 p-5 bg-zinc-950 border border-emerald-900/50 rounded-xl relative overflow-hidden shadow-lg">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-2 mb-4 pl-2">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <h3 className="font-bold text-emerald-500 uppercase tracking-wider text-sm">Riepilogo Lavoro</h3>
                </div>
                
                <div className="pl-2 grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Inizio</div>
                    <div className="text-white font-bold">{trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 font-medium">Fine</div>
                    <div className="text-white font-bold">{trip.actualEndTime ? new Date(trip.actualEndTime).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                  </div>
                  
                  {trip.workedMinutes != null && (
                    <div className="col-span-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-medium">Tempo totale lavorato</span>
                      <span className="text-xl font-black text-white">
                        {Math.floor(trip.workedMinutes / 60)}h {trip.workedMinutes % 60}m
                      </span>
                    </div>
                  )}
                  
                  {trip.actualCraneHours != null && (
                    <div className="col-span-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-medium">Ore utilizzo Gru</span>
                      <span className="text-xl font-black text-[#dc2626]">{trip.actualCraneHours}h</span>
                    </div>
                  )}
                </div>

                {trip.driverNotes && (
                  <div className="pl-2 mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Le tue note / Problemi in cantiere:</div>
                    <div className="text-emerald-100 text-lg italic bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/30">{trip.driverNotes}</div>
                  </div>
                )}
              </div>
            )}"""

content = content.replace(old_notes_block, new_summary_block)
with open(path, 'w') as f:
    f.write(content)

