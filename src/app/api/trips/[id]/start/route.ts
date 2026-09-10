import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const body = await request.json();
    const latitude = body.latitude ?? body.lat ?? null;
    const longitude = body.longitude ?? body.lng ?? null;

    const existingTrip = await prisma.trip.findUnique({ where: { id } });
    if (!existingTrip) return NextResponse.json({ success: false, error: 'Viaggio non trovato' }, { status: 404 });
    if (existingTrip.status !== 'DA_FARE') return NextResponse.json({ success: false, error: 'Il viaggio non è in stato DA_FARE' }, { status: 400 });

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { status: 'IN_CORSO', actualStartTime: new Date(), startLatitude: latitude, startLongitude: longitude },
    });

    await prisma.tripAuditLog.create({
      data: { tripId: id, action: 'STATUS_CHANGE', fieldName: 'status', oldValue: existingTrip.status, newValue: 'IN_CORSO', driverIdActor: existingTrip.driverId, userType: 'DRIVER' },
    });

    return NextResponse.json({ success: true, data: updatedTrip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
