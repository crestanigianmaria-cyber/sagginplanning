import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(office)/planning/PlanningClient.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix the trip card to show vehicle and crane badge
old_trip_card = """                    <div className="font-semibold text-sm mb-1">{trip.scheduledTime}</div>
                    <div className="text-xs font-medium mb-1 truncate">{trip.cargoDescription}</div>
                    <div className="text-[10px] opacity-80 truncate">{trip.address}</div>"""

new_trip_card = """                    <div className="font-semibold text-sm mb-1 font-space">{trip.scheduledTime}</div>
                    <div className="text-xs font-medium mb-1 truncate text-[var(--color-saggin-text-primary)]">{trip.cargoDescription}</div>
                    <div className="text-[10px] text-[var(--color-saggin-text-secondary)] truncate mb-2">{trip.clientName || trip.contactName || trip.address}</div>
                    
                    {/* Mezzo Assegnato al Viaggio e Gru */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)]">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-saggin-text-primary)] truncate">
                        <Truck className="h-3 w-3 shrink-0" />
                        <span className="truncate">{trip.vehicle?.name || 'Nessun mezzo'}</span>
                      </div>
                      {trip.needsCrane && (
                        <span className="bg-[var(--color-brand-red)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">
                          GRU
                        </span>
                      )}
                    </div>"""

content = content.replace(old_trip_card, new_trip_card)

# Update driver header in planning to use new styles and show avatar
old_driver_header = """                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 sticky top-0 z-10 shadow-sm">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      {driver.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Truck className="h-3 w-3" />
                      {driver.defaultVehicle?.name || 'Nessun mezzo'}
                    </p>
                  </div>"""

new_driver_header = """                  <div className="bg-[var(--color-saggin-surface)] border border-[var(--color-saggin-border)] rounded-xl p-3 mb-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                    {driver.profilePicture ? (
                      <img src={driver.profilePicture} alt={driver.name} className="w-10 h-10 rounded-full object-cover border border-[var(--color-saggin-border)] shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--color-saggin-elevated)] flex items-center justify-center font-bold text-[var(--color-saggin-text-primary)] border border-[var(--color-saggin-border)] shrink-0">
                        {driver.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <h3 className="font-semibold text-[var(--color-saggin-text-primary)] truncate">
                        {driver.name}
                      </h3>
                      <p className="text-xs text-[var(--color-saggin-text-secondary)] flex items-center gap-1 mt-0.5">
                        <Truck className="h-3 w-3 shrink-0" />
                        <span className="truncate">{driver.defaultVehicle?.name || 'Senza mezzo fisso'}</span>
                      </p>
                    </div>
                  </div>"""

content = content.replace(old_driver_header, new_driver_header)

with open(path, 'w') as f:
    f.write(content)
