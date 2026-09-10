import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/(driver)/my-trips/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Update Trip type to include contactName and clientName
old_type = """type Trip = {
  id: string
  status: 'DA_FARE' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
  scheduledTime: string
  cargoDescription: string
  address: string
  vehicleName: string
  needsCrane: boolean
}"""

new_type = """type Trip = {
  id: string
  status: 'DA_FARE' | 'IN_CORSO' | 'COMPLETATO' | 'ANNULLATO'
  scheduledTime: string
  cargoDescription: string
  address: string
  vehicleName: string
  needsCrane: boolean
  clientName?: string
  contactName?: string
}"""

content = content.replace(old_type, new_type)

old_card = """                <div className="text-3xl font-extrabold text-slate-900 mb-2">{trip.scheduledTime}</div>
                <div className="text-lg font-medium mb-3 pr-16 text-slate-700">{trip.cargoDescription}</div>
                
                <div className="flex items-start gap-2 text-slate-500 mb-3">
                  <MapPin size={20} className="mt-0.5 flex-shrink-0 text-rose-900" />
                  <span className="text-base line-clamp-2 leading-tight">{trip.address}</span>
                </div>"""

new_card = """                <div className="text-3xl font-extrabold text-[var(--color-saggin-text-primary)] mb-2 font-space">{trip.scheduledTime}</div>
                <div className="text-lg font-medium mb-3 pr-16 text-[var(--color-saggin-text-secondary)]">{trip.cargoDescription}</div>
                
                <div className="flex flex-col gap-1 mb-3 bg-[var(--color-saggin-bg)] p-3 rounded-lg border border-[var(--color-saggin-border)]">
                  <div className="text-sm font-semibold text-[var(--color-saggin-text-primary)]">
                    {trip.clientName || trip.contactName || 'Destinazione'}
                  </div>
                  <div className="flex items-start gap-2 text-[var(--color-saggin-text-secondary)]">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-brand-red)]" />
                    <span className="text-sm line-clamp-2 leading-tight">{trip.address}</span>
                  </div>
                </div>"""

content = content.replace(old_card, new_card)

with open(path, 'w') as f:
    f.write(content)
