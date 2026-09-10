import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const marino = await prisma.driver.findFirst({ where: { name: 'Marino' } });
  if (!marino) return console.log('Marino non trovato');
  
  console.log('PIN hash in DB:', marino.pin);
  const isValid = await bcrypt.compare('1111', marino.pin);
  console.log('Compare 1111 vs hash:', isValid);
}
check();
