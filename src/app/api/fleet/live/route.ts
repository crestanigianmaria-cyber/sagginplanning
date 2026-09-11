import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const depot = {
      name: 'Sede Saggin Trasporti',
      address: 'Via Padre Roberto 80, 36055 Nove (VI)',
      lat: 45.71902,
      lng: 11.67734
    };

    // Data odierna a mezzogiorno / intervallo oggi
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Tutti i viaggi programmati per oggi
    const tripsToday = await prisma.trip.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'ANNULLATO' }
      },
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: { scheduledTime: 'asc' }
    });

    // 2. Tutti gli autisti attivi
    const drivers = await prisma.driver.findMany({
      where: { status: 'ATTIVO' },
      include: {
        defaultVehicle: true,
        gpsTrackPoints: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    // Arricchisci gli autisti con il viaggio corrente e la posizione live
    const enrichedDrivers = drivers.map((driver) => {
      const activeTrip = tripsToday.find(t => t.driverId === driver.id && t.status === 'IN_CORSO');
      const nextTrip = tripsToday.find(t => t.driverId === driver.id && t.status === 'DA_FARE');
      const latestGps = driver.gpsTrackPoints[0] || null;

      // Se c'è un GPS registrato usalo, altrimenti fallback su coordinate cantiere o sede
      let currentLat = latestGps?.latitude;
      let currentLng = latestGps?.longitude;
      let lastUpdate = latestGps?.timestamp || null;

      // Fallback realistico: se in corso e il viaggio ha lat/lng
      if (!currentLat && activeTrip?.latitude && activeTrip?.longitude) {
        currentLat = activeTrip.latitude;
        currentLng = activeTrip.longitude;
      }
      // Se nessun dato GPS, posiziona temporaneamente presso la sede Saggin
      if (!currentLat || !currentLng) {
        // Leggero offset attorno alla sede per non sovrapporre i marker
        const offsetIdx = drivers.indexOf(driver);
        currentLat = depot.lat + (offsetIdx - 1.5) * 0.0015;
        currentLng = depot.lng + (offsetIdx - 1.5) * 0.0015;
      }

      return {
        id: driver.id,
        name: driver.name,
        role: driver.role,
        profilePicture: driver.profilePicture,
        defaultVehicle: driver.defaultVehicle,
        currentTrip: activeTrip || nextTrip || null,
        status: activeTrip ? 'IN_VIAGGIO' : (nextTrip ? 'IN_ATTESA' : 'DISPONIBILE'),
        position: {
          lat: currentLat,
          lng: currentLng,
          lastUpdate: lastUpdate
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        depot,
        drivers: enrichedDrivers,
        tripsToday
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
