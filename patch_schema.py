path = '/Users/gian/Documents/saggin/plannig/app/prisma/schema.prisma'
with open(path, 'r') as f:
    content = f.read()

# Make driverId and vehicleId optional in Trip
content = content.replace('driverId           String', 'driverId           String?')
content = content.replace('vehicleId          String', 'vehicleId          String?')
content = content.replace('driver             Driver             @relation(fields: [driverId], references: [id])', 'driver             Driver?            @relation(fields: [driverId], references: [id])')
content = content.replace('vehicle            Vehicle            @relation("TripVehicle", fields: [vehicleId], references: [id])', 'vehicle            Vehicle?           @relation("TripVehicle", fields: [vehicleId], references: [id])')

# Add clientName to Trip
if 'clientName' not in content:
    content = content.replace('cargoDescription   String', 'cargoDescription   String\n  clientName         String?')

# Add profilePicture to Driver
if 'profilePicture' not in content:
    content = content.replace('defaultVehicleId String?', 'defaultVehicleId String?\n  profilePicture   String?')

with open(path, 'w') as f:
    f.write(content)
