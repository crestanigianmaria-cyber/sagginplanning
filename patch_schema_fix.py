import re
path = '/Users/gian/Documents/saggin/plannig/app/prisma/schema.prisma'
with open(path, 'r') as f:
    content = f.read()

content = re.sub(r'driver\s+Driver\s+@relation', 'driver             Driver?            @relation', content)
content = re.sub(r'vehicle\s+Vehicle\s+@relation\("TripVehicle"', 'vehicle            Vehicle?           @relation("TripVehicle"', content)

with open(path, 'w') as f:
    f.write(content)
