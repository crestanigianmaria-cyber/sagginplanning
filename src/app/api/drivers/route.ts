import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        status: 'ATTIVO',
      },
      include: {
        defaultVehicle: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json({ success: true, data: drivers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let hashedPin = null;
    if (body.pin) {
      hashedPin = await bcrypt.hash(body.pin, 10);
    }
    
    const driver = await prisma.driver.create({
      data: {
        ...body,
        pin: hashedPin,
      }
    });
    
    return NextResponse.json({ success: true, data: driver });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
