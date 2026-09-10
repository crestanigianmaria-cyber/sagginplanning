import React from 'react';
import prisma from '@/lib/prisma';
import PlanningClient from './PlanningClient';

export default async function PlanningPage() {
  const drivers = await prisma.driver.findMany({
    include: { defaultVehicle: true },
    where: { status: 'ATTIVO' },
    orderBy: { name: 'asc' }
  });

  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'DISPONIBILE' },
    orderBy: { name: 'asc' }
  });

  const trips = await prisma.trip.findMany({
    include: {
      vehicle: true
    },
    where: {
      date: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      }
    }
  });

  // Convert dates to string so they can be passed to Client Component
  const formattedTrips = trips.map(t => ({
    ...t,
    date: t.date.toISOString(),
  }));

  return <PlanningClient initialDrivers={drivers} initialTrips={formattedTrips} initialVehicles={vehicles} />;
}
