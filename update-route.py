import re

path = '/Users/gian/Documents/saggin/plannig/app/src/app/api/trips/route.ts'
with open(path, 'r') as f:
    content = f.read()

# Add createdById and createdByType
old_create = """    const trip = await prisma.trip.create({
      data: {
        ...body,
        status: 'DA_FARE',
      },
    });"""

new_create = """    const creatorId = (session && (session.user as any)?.id) ? (session.user as any).id : undefined;
    const trip = await prisma.trip.create({
      data: {
        ...body,
        status: 'DA_FARE',
        createdById: creatorId,
        createdByType: creatorId ? 'OFFICE' : undefined,
      },
    });"""

content = content.replace(old_create, new_create)
with open(path, 'w') as f:
    f.write(content)

