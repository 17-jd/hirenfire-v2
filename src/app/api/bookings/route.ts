import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

const userSelect = 'id, name, email, avatar, rating'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    const { data: bookings } = await db
      .from('Booking')
      .select(`*, customer:User!customerId(${userSelect}), provider:User!providerId(${userSelect})`)
      .or(`customerId.eq.${user.id},providerId.eq.${user.id}`)
      .order('createdAt', { ascending: false })

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    const data = await request.json()
    const { serviceAddress, serviceLat, serviceLng, serviceType, description, scheduledDate, scheduledTime, hours } = data

    if (!serviceAddress || !serviceType) {
      return NextResponse.json(
        { error: 'Service address and service type are required' },
        { status: 400 }
      )
    }

    const hourlyRates: Record<string, number> = {
      electrician: 75,
      tech_support: 65,
      ac_technician: 80,
      plumbing: 70,
    }

    const hourlyRate = hourlyRates[serviceType] || 70
    const estimatedHours = hours || 1.5
    const totalAmount = hourlyRate * estimatedHours

    const { data: booking, error: dbError } = await db
      .from('Booking')
      .insert({
        id: crypto.randomUUID().replace(/-/g, '').slice(0, 25),
        customerId: user.id,
        serviceAddress,
        serviceLat: serviceLat || null,
        serviceLng: serviceLng || null,
        serviceType,
        description: description || null,
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        hours: estimatedHours,
        hourlyRate,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        requestedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select(`*, customer:User!customerId(${userSelect})`)
      .single()

    if (dbError) {
      console.error('Create booking error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
