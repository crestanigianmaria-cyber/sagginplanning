import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/planning/PlanningClient.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add unassignedTrips
old_map = "            {drivers.map(driver => {"
new_map = """            {/* Colonna: Viaggi da Assegnare */}
            <div className="flex-none w-80 bg-[var(--color-saggin-bg)] rounded-2xl border border-[var(--color-brand-red)]/50 p-4 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-red)]"></div>
              
              <div className="bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/20 rounded-xl p-3 mb-4 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center text-white shrink-0">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-[var(--color-brand-red)] truncate font-space">
                    Da Assegnare
                  </h3>
                </div>
                <div className="text-xs font-bold text-[var(--color-brand-red)] bg-white/10 px-2 py-1 rounded">
                  {trips.filter(t => !t.driverId).length}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {trips.filter(t => !t.driverId).length === 0 ? (
                  <div className="text-center p-6 border-2 border-dashed border-[var(--color-brand-red)]/20 rounded-xl text-[var(--color-brand-red)]/60 text-sm">
                    Nessun viaggio in attesa
                  </div>
                ) : (
                  trips.filter(t => !t.driverId).map(trip => (
                    <div 
                      key={trip.id} 
                      className="bg-[var(--color-saggin-surface)] p-4 rounded-xl border border-[var(--color-brand-red)]/30 shadow-sm cursor-pointer hover:border-[var(--color-brand-red)] transition-colors relative"
                    >
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--color-brand-red)] animate-pulse"></div>
                      <div className="font-bold text-sm mb-1 font-space text-[var(--color-saggin-text-primary)]">{trip.scheduledTime}</div>
                      <div className="text-xs font-medium mb-1 truncate text-[var(--color-saggin-text-primary)]">{trip.cargoDescription}</div>
                      <div className="text-[10px] text-[var(--color-saggin-text-secondary)] truncate mb-2">{trip.clientName || trip.contactName || trip.address}</div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-saggin-border)]">
                        <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-saggin-text-secondary)]">
                          <Truck className="h-3 w-3" />
                          <span className="truncate">{trip.vehicle?.name || 'Mezzo da definire'}</span>
                        </div>
                        {trip.needsCrane && (
                          <span className="bg-[var(--color-brand-red)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1">
                            GRU
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-dashed border-[var(--color-saggin-border)]">
                        <button className="w-full py-1.5 bg-[var(--color-brand-red)]/10 hover:bg-[var(--color-brand-red)] hover:text-white text-[var(--color-brand-red)] text-xs font-medium rounded transition-colors text-center">
                          Assegna Autista
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {drivers.map(driver => {"""

content = content.replace(old_map, new_map)

# Make sure AlertCircle is imported
if 'AlertCircle' not in content:
    content = content.replace('Calendar as CalendarIcon,', 'Calendar as CalendarIcon, AlertCircle,')

with open(path, 'w') as f:
    f.write(content)
