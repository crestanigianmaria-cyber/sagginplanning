import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.tripAuditLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: {
        officeUser: { select: { name: true } },
        trip: {
          select: {
            id: true,
            cargoDescription: true,
            clientName: true,
            address: true,
            scheduledTime: true,
            status: true,
            driver: { select: { name: true } }
          }
        }
      }
    });

    const notifications = logs.map(log => {
      let title = 'Attività Viaggio';
      let message = '';
      let type: 'info' | 'success' | 'warning' = 'info';

      const driverName = log.trip.driver?.name || 'Autista';
      const client = log.trip.clientName || log.trip.cargoDescription;

      if (log.action === 'STATUS_CHANGE') {
        if (log.newValue === 'IN_CORSO') {
          title = `${driverName} ha iniziato il viaggio`;
          message = `Corsa per "${client}" avviata alle ${new Date(log.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
          type = 'warning';
        } else if (log.newValue === 'COMPLETATO') {
          title = `${driverName} ha completato la consegna`;
          message = `Lavoro per "${client}" completato con successo`;
          type = 'success';
        } else {
          title = `Stato viaggio aggiornato: ${log.newValue}`;
          message = `Viaggio per "${client}"`;
        }
      } else if (log.action === 'CREATE') {
        title = `Nuovo viaggio programmato`;
        message = `Inserito da ${log.officeUser?.name || 'Ufficio'} per ${driverName} (${log.trip.scheduledTime})`;
        type = 'info';
      } else if (log.action === 'UPDATE') {
        title = `Modifica viaggio`;
        message = `Aggiornato viaggio per "${client}"`;
        type = 'info';
      }

      return {
        id: log.id,
        tripId: log.tripId,
        title,
        message,
        type,
        timestamp: log.timestamp.toISOString(),
        author: log.officeUser?.name || driverName
      };
    });

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
