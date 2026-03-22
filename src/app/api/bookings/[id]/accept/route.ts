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

    if (user.role !== 'provider') {
      return NextResponse.json({ error: 'Only providers can accept bookings' }, { status: 403 })
    }

    const { id } = await params

    const { data: existingBooking } = await db
      .from('Booking')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found or no longer available' }, { status: 404 })
    }

    const { data: providerInfo } = await db
      .from('ProviderInfo')
      .select('hourlyRate')
      .eq('userId', user.id)
      .single()

    const hourlyRate = providerInfo?.hourlyRate || existingBooking.hourlyRate

    const { data: booking, error: dbError } = await db
      .from('Booking')
      .update({
        providerId: user.id,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        hourlyRate,
        totalAmount: hourlyRate * existingBooking.hours,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select(`*, customer:User!customerId(${userSelect}, phone), provider:User!providerId(${userSelect})`)
      .single()

    if (dbError || !booking) {
      return NextResponse.json({ error: 'Booking is no longer available' }, { status: 400 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Accept booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
