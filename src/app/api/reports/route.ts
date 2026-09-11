import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default: mese corrente
    const now = new Date();
    const start = startDateParam 
      ? new Date(startDateParam) 
      : new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = endDateParam 
      ? new Date(endDateParam) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // 1. Viaggi nel periodo
    const trips = await prisma.trip.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { not: 'ANNULLATO' }
      },
      include: {
        driver: true,
        vehicle: true
      },
      orderBy: { date: 'asc' }
    });

    // 2. Ore manuali nel periodo
    const manualHours = await prisma.manualWorkHour.findMany({
      where: {
        date: { gte: start, lte: end }
      },
      include: { driver: true }
    });

    // 3. Autisti e Mezzi
    const drivers = await prisma.driver.findMany({
      where: { status: 'ATTIVO' },
      include: { defaultVehicle: true },
      orderBy: { name: 'asc' }
    });

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { name: 'asc' }
    });

    // Aggregazione per Autista
    const driverStats = drivers.map(d => {
      const dTrips = trips.filter(t => t.driverId === d.id);
      const completedTrips = dTrips.filter(t => t.status === 'COMPLETATO');
      const tripMinutes = completedTrips.reduce((acc, t) => acc + (t.workedMinutes || 0), 0);
      const craneHours = completedTrips.reduce((acc, t) => acc + (t.actualCraneHours || 0), 0);

      const dManual = manualHours.filter(m => m.driverId === d.id);
      const approvedManualMinutes = dManual.filter(m => m.status === 'APPROVATO').reduce((acc, m) => acc + m.minutes, 0);
      const pendingManualMinutes = dManual.filter(m => m.status === 'DA_APPROVARE').reduce((acc, m) => acc + m.minutes, 0);

      return {
        driverId: d.id,
        driverName: d.name,
        profilePicture: d.profilePicture,
        defaultVehicle: d.defaultVehicle?.name || 'Nessuno',
        totalTrips: dTrips.length,
        completedTrips: completedTrips.length,
        tripMinutes,
        craneHours: Number(craneHours.toFixed(1)),
        approvedManualMinutes,
        pendingManualMinutes,
        totalWorkedMinutes: tripMinutes + approvedManualMinutes
      };
    });

    // Aggregazione per Cliente
    const clientMap: Record<string, {
      name: string;
      tripsCount: number;
      completedCount: number;
      craneHours: number;
      totalWeightKg: number;
      destinations: Set<string>;
    }> = {};

    trips.forEach(t => {
      const client = t.clientName?.trim() || t.contactName?.trim() || 'Committente non specificato';
      if (!clientMap[client]) {
        clientMap[client] = {
          name: client,
          tripsCount: 0,
          completedCount: 0,
          craneHours: 0,
          totalWeightKg: 0,
          destinations: new Set()
        };
      }
      clientMap[client].tripsCount += 1;
      if (t.status === 'COMPLETATO') {
        clientMap[client].completedCount += 1;
        clientMap[client].craneHours += t.actualCraneHours || 0;
      }
      if (t.cargoWeight) clientMap[client].totalWeightKg += t.cargoWeight;
      if (t.address) clientMap[client].destinations.add(t.address);
    });

    const clientStats = Object.values(clientMap).map(c => ({
      name: c.name,
      tripsCount: c.tripsCount,
      completedCount: c.completedCount,
      craneHours: Number(c.craneHours.toFixed(1)),
      totalWeightKg: c.totalWeightKg,
      destinationsCount: c.destinations.size
    })).sort((a, b) => b.tripsCount - a.tripsCount);

    // Aggregazione per Mezzo
    const vehicleStats = vehicles.map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id);
      const estKm = vTrips.reduce((acc, t) => acc + (t.estimatedDistanceKm || 0), 0);
      const craneTrips = vTrips.filter(t => t.needsCrane);

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        type: v.type,
        hasCrane: v.hasCrane,
        tripsCount: vTrips.length,
        craneTripsCount: craneTrips.length,
        estimatedTotalKm: Math.round(estKm)
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        totals: {
          totalTrips: trips.length,
          completedTrips: trips.filter(t => t.status === 'COMPLETATO').length,
          totalCraneHours: Number(trips.reduce((acc, t) => acc + (t.actualCraneHours || 0), 0).toFixed(1)),
          totalWorkedHours: Number(((driverStats.reduce((acc, d) => acc + d.totalWorkedMinutes, 0)) / 60).toFixed(1))
        },
        driverStats,
        clientStats,
        vehicleStats
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
