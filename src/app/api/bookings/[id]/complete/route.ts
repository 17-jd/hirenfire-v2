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
    const data = await request.json().catch(() => ({}))
    const { otp, actualHours } = data

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

    if (existingBooking.status !== 'in_progress') {
      return NextResponse.json({ error: 'Booking must be in progress' }, { status: 400 })
    }

    // OTP verification
    if (!existingBooking.otp) {
      return NextResponse.json({ error: 'Customer must generate OTP first' }, { status: 400 })
    }

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required to complete the job' }, { status: 400 })
    }

    if (otp !== existingBooking.otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Check OTP expiry (30 minutes)
    if (existingBooking.otpGeneratedAt) {
      const otpAge = Date.now() - new Date(existingBooking.otpGeneratedAt).getTime()
      if (otpAge > 30 * 60 * 1000) {
        return NextResponse.json({ error: 'OTP has expired. Customer must generate a new one.' }, { status: 400 })
      }
    }

    const finalHours = actualHours || existingBooking.hours
    const totalAmount = existingBooking.hourlyRate * finalHours

    const { data: booking, error: dbError } = await db
      .from('Booking')
      .update({
        status: 'completed',
        completedAt: new Date().toISOString(),
        hours: finalHours,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentStatus: 'paid',
        otp: null,
        otpGeneratedAt: null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, customer:User!customerId(${userSelect}), provider:User!providerId(${userSelect})`)
      .single()

    if (dbError) {
      console.error('Complete booking error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Update provider stats
    const { data: providerUser } = await db
      .from('User')
      .select('totalJobs')
      .eq('id', user.id)
      .single()

    if (providerUser) {
      await db.from('User').update({
        totalJobs: (providerUser.totalJobs || 0) + 1,
        updatedAt: new Date().toISOString(),
      }).eq('id', user.id)
    }

    const { data: providerInfo } = await db
      .from('ProviderInfo')
      .select('earnings, completedJobs')
      .eq('userId', user.id)
      .single()

    if (providerInfo) {
      await db.from('ProviderInfo').update({
        earnings: (providerInfo.earnings || 0) + totalAmount,
        completedJobs: (providerInfo.completedJobs || 0) + 1,
        updatedAt: new Date().toISOString(),
      }).eq('userId', user.id)
    }

    // Update customer stats
    const { data: customerUser } = await db
      .from('User')
      .select('totalJobs')
      .eq('id', existingBooking.customerId)
      .single()

    if (customerUser) {
      await db.from('User').update({
        totalJobs: (customerUser.totalJobs || 0) + 1,
        updatedAt: new Date().toISOString(),
      }).eq('id', existingBooking.customerId)
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Complete booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
