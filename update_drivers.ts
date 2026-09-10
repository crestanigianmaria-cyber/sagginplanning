import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const drivers = await prisma.driver.findMany();
  for (const driver of drivers) {
    const firstName = driver.name.toLowerCase().split(' ')[0];
    if (['francesco', 'marino', 'luca', 'claudio'].includes(firstName)) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { profilePicture: `/drivers/${firstName}.png` }
      })
      console.log(`Updated profile pic for ${driver.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
