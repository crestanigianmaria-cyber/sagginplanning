import re

path = '/Users/gian/Documents/saggin/plannig/app/src/components/trips/TripForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Make driver and vehicle optional
content = content.replace('<label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Autista *</label>', '<label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Autista (Opzionale)</label>')
content = content.replace('name="driverId" value={formData.driverId} onChange={handleChange} required', 'name="driverId" value={formData.driverId} onChange={handleChange}')
content = content.replace('<option value="">Seleziona...</option>', '<option value="">Da Assegnare</option>')

content = content.replace('<label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Mezzo *</label>', '<label className="block text-xs font-medium text-[var(--color-saggin-text-secondary)] mb-1">Mezzo (Opzionale)</label>')
content = content.replace('name="vehicleId" value={formData.vehicleId} onChange={handleChange} required', 'name="vehicleId" value={formData.vehicleId} onChange={handleChange}')

content = content.replace('driverId: formData.driverId,', 'driverId: formData.driverId || null,')
content = content.replace('vehicleId: formData.vehicleId,', 'vehicleId: formData.vehicleId || null,')

with open(path, 'w') as f:
    f.write(content)
