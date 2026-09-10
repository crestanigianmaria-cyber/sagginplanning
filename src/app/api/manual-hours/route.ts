import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const driverIdParam = searchParams.get('driverId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const user = session.user as any
    const driverId = user.userType === 'DRIVER' ? user.id : (driverIdParam || undefined)

    const where: any = {}
    if (driverId) {
      where.driverId = driverId
    }

    if (startDateParam || endDateParam) {
      where.date = {}
      if (startDateParam) where.date.gte = new Date(startDateParam)
      if (endDateParam) where.date.lte = new Date(endDateParam)
    }

    const manualHours = await prisma.manualWorkHour.findMany({
      where,
      include: {
        driver: {
          select: { id: true, name: true, profilePicture: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ success: true, data: manualHours })
  } catch (error: any) {
    console.error('Error fetching manual hours:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const user = session.user as any
    const body = await request.json()
    const { driverId: bodyDriverId, date, category, startTime, endTime, minutes, note } = body

    const targetDriverId = user.userType === 'DRIVER' ? user.id : bodyDriverId
    if (!targetDriverId) {
      return NextResponse.json({ success: false, error: 'Autista non specificato' }, { status: 400 })
    }

    let calculatedMinutes = minutes ? parseInt(minutes, 10) : 0
    if (!calculatedMinutes && startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number)
      const [eh, em] = endTime.split(':').map(Number)
      calculatedMinutes = (eh * 60 + em) - (sh * 60 + sm)
      if (calculatedMinutes < 0) calculatedMinutes += 24 * 60
    }

    if (calculatedMinutes <= 0) {
      return NextResponse.json({ success: false, error: 'Durata non valida' }, { status: 400 })
    }

    const entry = await prisma.manualWorkHour.create({
      data: {
        driverId: targetDriverId,
        date: date ? new Date(date) : new Date(),
        category: category || 'ALTRO',
        startTime: startTime || null,
        endTime: endTime || null,
        minutes: calculatedMinutes,
        note: note || null,
        status: user.userType === 'OFFICE' ? 'APPROVATO' : 'DA_APPROVARE'
      },
      include: {
        driver: {
          select: { id: true, name: true, profilePicture: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error: any) {
    console.error('Error creating manual hour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
