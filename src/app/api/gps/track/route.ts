import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, driverId, latitude, longitude, accuracy } = body;

    const trackPoint = await prisma.gpsTrackPoint.create({
      data: {
        tripId,
        driverId,
        latitude,
        longitude,
        accuracy,
      }
    });

    return NextResponse.json({ success: true, data: trackPoint });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
