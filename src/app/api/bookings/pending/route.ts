import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    if (user.role !== 'provider') {
      return NextResponse.json({ error: 'Only providers can view pending bookings' }, { status: 403 })
    }

    const { data: bookings } = await db
      .from('Booking')
      .select('*, customer:User!customerId(id, name, email, avatar, rating, phone)')
      .eq('status', 'pending')
      .order('requestedAt', { ascending: true })

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Get pending bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
