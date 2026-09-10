import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, category, minutes, startTime, endTime, note } = body

    const user = session.user as any

    const data: any = {}
    if (status) data.status = status
    if (category) data.category = category
    if (note !== undefined) data.note = note
    if (startTime !== undefined) data.startTime = startTime
    if (endTime !== undefined) data.endTime = endTime

    if (minutes !== undefined) {
      data.minutes = parseInt(minutes, 10)
    } else if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number)
      const [eh, em] = endTime.split(':').map(Number)
      let calc = (eh * 60 + em) - (sh * 60 + sm)
      if (calc < 0) calc += 24 * 60
      data.minutes = calc
    }

    const updated = await prisma.manualWorkHour.update({
      where: { id },
      data,
      include: {
        driver: {
          select: { id: true, name: true, profilePicture: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Error updating manual hour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { id } = await params
    await prisma.manualWorkHour.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting manual hour:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
