import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const hasCrane = searchParams.get('hasCrane');
    const status = searchParams.get('status') || 'DISPONIBILE';

    const where: any = {};
    if (type) where.type = type;
    if (hasCrane !== null) where.hasCrane = hasCrane === 'true';
    if (status) where.status = status;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        configurations: true,
        craneCapacityCurves: {
          include: {
            points: true,
          }
        },
      },
      orderBy: {
        name: 'asc',
      }
    });

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vehicle = await prisma.vehicle.create({
      data: body
    });
    return NextResponse.json({ success: true, data: vehicle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
