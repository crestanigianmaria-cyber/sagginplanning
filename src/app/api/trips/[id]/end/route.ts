import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;  // FIXED: await params
    const body = await request.json();
    const lat = body.lat ?? body.latitude ?? null;
    const lng = body.lng ?? body.longitude ?? null;
    const { actualCraneHours, driverNotes, recipientSignature, recipientName, deliveryPhotoUrl } = body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return NextResponse.json({ success: false, error: 'Viaggio non trovato' }, { status: 404 });
    if (trip.status !== 'IN_CORSO') return NextResponse.json({ success: false, error: 'Il viaggio non è in corso' }, { status: 400 });

    const actualEndTime = new Date();
    let workedMinutes = 0;
    if (trip.actualStartTime) {
      workedMinutes = Math.max(0, Math.floor((actualEndTime.getTime() - trip.actualStartTime.getTime()) / 60000));
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETATO',
        actualEndTime,
        endLatitude: lat,
        endLongitude: lng,
        workedMinutes,
        actualCraneHours: actualCraneHours ? parseFloat(actualCraneHours) : null,
        driverNotes: driverNotes || null,
        recipientSignature: recipientSignature || null,
        recipientName: recipientName || null,
        deliveryPhotoUrl: deliveryPhotoUrl || null,
        signedAt: recipientSignature ? new Date() : null,
      },
    });

    if (lat && lng) {
      await prisma.gpsTrackPoint.create({ data: { tripId: id, driverId: trip.driverId || 'unknown', latitude: lat, longitude: lng } });
    }

    await prisma.tripAuditLog.create({
      data: { tripId: id, action: 'STATUS_CHANGE', oldValue: 'IN_CORSO', newValue: 'COMPLETATO', driverIdActor: trip.driverId, userType: 'DRIVER' },
    });

    return NextResponse.json({ success: true, data: updatedTrip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
