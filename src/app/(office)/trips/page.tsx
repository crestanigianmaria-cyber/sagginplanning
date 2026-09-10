import React from 'react';
import prisma from '@/lib/prisma';
import TripsClient from './TripsClient';

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    include: {
      driver: true,
      vehicle: true,
    },
    orderBy: [
      { date: 'desc' },
      { scheduledTime: 'asc' }
    ]
  });

  const drivers = await prisma.driver.findMany({
    where: { status: 'ATTIVO' },
    orderBy: { name: 'asc' }
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'DISPONIBILE' },
    orderBy: { name: 'asc' }
  });

  return <TripsClient initialTrips={trips} drivers={drivers} vehicles={vehicles} />;
}
