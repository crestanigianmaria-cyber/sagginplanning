import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const drivers = await prisma.driver.findMany({
    where: { status: 'ATTIVO' },
    select: { id: true, name: true }
  });
  
  return NextResponse.json(drivers.map(d => {
    const parts = d.name.split(' ');
    const initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : d.name.substring(0, 2);
    return {
      id: d.id,
      name: d.name,
      initials: initials.toUpperCase()
    };
  }));
}
