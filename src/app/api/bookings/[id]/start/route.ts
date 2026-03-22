import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

const userSelect = 'id, name, email, avatar, rating'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    const { id } = await params

    const { data: existingBooking } = await db
      .from('Booking')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (existingBooking.providerId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (existingBooking.status !== 'accepted') {
      return NextResponse.json({ error: 'Booking must be accepted first' }, { status: 400 })
    }

    const { data: booking, error: dbError } = await db
      .from('Booking')
      .update({
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, customer:User!customerId(${userSelect}), provider:User!providerId(${userSelect})`)
      .single()

    if (dbError) {
      console.error('Start booking error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Start booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
