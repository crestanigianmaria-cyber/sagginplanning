import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: true, vehicle: true, trailer: true, auditLogs: { include: { officeUser: true }, orderBy: { timestamp: 'desc' } }, gpsTrackPoints: { orderBy: { timestamp: 'asc' } } },
    });
    if (!trip) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    let creatorName = trip.auditLogs?.find((a: any) => a.action === 'CREATE')?.officeUser?.name;
    if (!creatorName && trip.createdById) {
      const officeUser = await prisma.officeUser.findUnique({ where: { id: trip.createdById }, select: { name: true } });
      creatorName = officeUser?.name;
    }
    return NextResponse.json({ success: true, data: { ...trip, createdByName: creatorName || 'Ufficio Saggin' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Whitelist dei soli campi modificabili
    const allowed = ['date','scheduledTime','driverId','vehicleId','trailerId','cargoDescription','clientName','cargoWeight','cargoLength','cargoWidth','cargoHeight','palletCount','needsCrane','craneWorkRadius','address','latitude','longitude','contactName','contactPhone','clientOrderNumber','notes','estimatedDistanceKm','estimatedDurationMins','createdById','recipientSignature','recipientName','deliveryPhotoUrl','signedAt','actualCraneHours','driverNotes'];
    const data: any = {};
    for (const key of allowed) { if (key in body) data[key] = body[key]; }

    // Conflict check per veicolo
    if (data.vehicleId && data.date && data.scheduledTime) {
      const startOfDay = new Date(data.date); startOfDay.setUTCHours(0,0,0,0);
      const endOfDay = new Date(data.date); endOfDay.setUTCHours(23,59,59,999);
      const existing = await prisma.trip.findMany({
        where: { vehicleId: data.vehicleId, date: { gte: startOfDay, lte: endOfDay }, status: { notIn: ['ANNULLATO','COMPLETATO'] }, id: { not: id } }
      });
      const [rH,rM] = data.scheduledTime.split(':').map(Number);
      const reqMins = rH*60+rM;
      for (const t of existing) {
        if (!t.scheduledTime) continue;
        const [eH,eM] = t.scheduledTime.split(':').map(Number);
        if (Math.abs(reqMins-(eH*60+eM)) < (t.estimatedDurationMins || 180)) {
          return NextResponse.json({ success: false, error: 'CONFLICT_VEHICLE', message: 'Il camion selezionato è già occupato in un orario sovrapponibile.' }, { status: 409 });
        }
      }
    }

    const trip = await prisma.trip.update({ where: { id }, data, include: { auditLogs: { include: { officeUser: true } } } });
    if (session && (session.user as any)?.id) {
      await prisma.tripAuditLog.create({ data: { tripId: trip.id, action: 'UPDATE', officeUserId: (session.user as any).id, userType: 'OFFICE' } });
    }
    let creatorName = trip.auditLogs?.find((a: any) => a.action === 'CREATE')?.officeUser?.name;
    if (!creatorName && trip.createdById) {
      const officeUser = await prisma.officeUser.findUnique({ where: { id: trip.createdById }, select: { name: true } });
      creatorName = officeUser?.name;
    }
    return NextResponse.json({ success: true, data: { ...trip, createdByName: creatorName || 'Ufficio Saggin' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const trip = await prisma.trip.update({ where: { id }, data: { status: 'ANNULLATO' }, include: { auditLogs: { include: { officeUser: true } } } });
    if (session && (session.user as any)?.id) {
      await prisma.tripAuditLog.create({ data: { tripId: trip.id, action: 'STATUS_CHANGE', newValue: 'ANNULLATO', officeUserId: (session.user as any).id, userType: 'OFFICE' } });
    }
    let creatorName = trip.auditLogs?.find((a: any) => a.action === 'CREATE')?.officeUser?.name;
    if (!creatorName && trip.createdById) {
      const officeUser = await prisma.officeUser.findUnique({ where: { id: trip.createdById }, select: { name: true } });
      creatorName = officeUser?.name;
    }
    return NextResponse.json({ success: true, data: { ...trip, createdByName: creatorName || 'Ufficio Saggin' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
