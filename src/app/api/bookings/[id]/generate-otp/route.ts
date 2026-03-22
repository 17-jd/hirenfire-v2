import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    const { id } = await params

    const { data: booking } = await db
      .from('Booking')
      .select('*')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== user.id) {
      return NextResponse.json({ error: 'Only the customer can generate OTP' }, { status: 403 })
    }

    if (booking.status !== 'in_progress') {
      return NextResponse.json({ error: 'Job must be in progress to generate OTP' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: dbError } = await db
      .from('Booking')
      .update({
        otp,
        otpGeneratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)

    if (dbError) {
      console.error('Generate OTP error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ otp })
  } catch (error) {
    console.error('Generate OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
