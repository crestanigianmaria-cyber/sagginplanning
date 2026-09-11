import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const weekStart = searchParams.get('weekStart');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const unassigned = searchParams.get('unassigned');

    const where: any = {};

    if (unassigned === 'true') {
      // I viaggi da assegnare devono essere visibili SEMPRE, indipendentemente dalla settimana o data!
      where.driverId = null;
      where.status = { notIn: ['ANNULLATO', 'COMPLETATO'] };
    } else {
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        where.date = { gte: startOfDay, lte: endOfDay };
      } else if (weekStart) {
        const startOfWeek = new Date(weekStart);
        startOfWeek.setUTCHours(0, 0, 0, 0);
        const endOfWeek = new Date(weekStart);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);
        where.date = { gte: startOfWeek, lte: endOfWeek };
      }

      if (driverId) {
        where.driverId = driverId;
      }

      if (status) {
        where.status = status;
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        driver: true,
        vehicle: true,
        trailer: true,
        auditLogs: { include: { officeUser: true } },
      },
      orderBy: [
        { date: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    const officeUsers = await prisma.officeUser.findMany({ select: { id: true, name: true } });
    const officeMap = new Map(officeUsers.map(u => [u.id, u.name]));

    const enrichedTrips = trips.map(t => {
      let creatorName = t.auditLogs?.find(a => a.action === 'CREATE')?.officeUser?.name;
      if (!creatorName && t.createdById) {
        creatorName = officeMap.get(t.createdById);
      }
      return {
        ...t,
        createdByName: creatorName || 'Ufficio Saggin'
      };
    });

    return NextResponse.json({ success: true, data: enrichedTrips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // 1. Validazione sovrapposizioni Mezzo/Orario
    if (body.vehicleId && body.date && body.scheduledTime) {
      const startOfDay = new Date(body.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(body.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Trova viaggi esistenti per questo mezzo nello stesso giorno
      const existingTrips = await prisma.trip.findMany({
        where: {
          vehicleId: body.vehicleId,
          date: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ['ANNULLATO', 'COMPLETATO'] }
        }
      });

      // Controlla se c'è una sovrapposizione di +/- 3 ore
      const [reqHour, reqMin] = body.scheduledTime.split(':').map(Number);
      const reqTimeMins = reqHour * 60 + reqMin;

      for (const t of existingTrips) {
        if (!t.scheduledTime) continue;
        const [exHour, exMin] = t.scheduledTime.split(':').map(Number);
        const exTimeMins = exHour * 60 + exMin;

        // Se la differenza è meno di 180 minuti (3 ore), consideralo occupato
        if (Math.abs(reqTimeMins - exTimeMins) < 180) {
          return NextResponse.json(
            { success: false, error: 'CONFLICT_VEHICLE', message: 'Il camion selezionato è già occupato in un orario sovrapponibile in questa giornata.' },
            { status: 409 }
          );
        }
      }
    }

    const creatorId = body.createdById || ((session && (session.user as any)?.id) ? (session.user as any).id : undefined);
    const trip = await prisma.trip.create({
      data: {
        ...body,
        status: 'DA_FARE',
        createdById: creatorId,
        createdByType: creatorId ? 'OFFICE' : undefined,
      },
    });

    if (session && (session.user as any)?.id) {
      await prisma.tripAuditLog.create({
        data: {
          tripId: trip.id,
          action: 'CREATE',
          officeUserId: (session.user as any).id,
          userType: 'OFFICE',
        },
      });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
