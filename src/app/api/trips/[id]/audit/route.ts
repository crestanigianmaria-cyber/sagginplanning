import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const auditLogs = await prisma.tripAuditLog.findMany({
      where: { tripId: id },
      include: {
        officeUser: {
          select: { name: true }
        }
      },
      orderBy: {
        timestamp: 'desc',
      }
    });

    return NextResponse.json({ success: true, data: auditLogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
