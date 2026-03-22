import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    const { bookingId, rating, comment } = await request.json()

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid bookingId and rating (1-5) are required' }, { status: 400 })
    }

    // Verify booking exists, is completed, and user is the customer
    const { data: booking } = await db
      .from('Booking')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== user.id) {
      return NextResponse.json({ error: 'Only the customer can leave a review' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 })
    }

    // Check if review already exists
    const { data: existingReview } = await db
      .from('Review')
      .select('id')
      .eq('bookingId', bookingId)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted for this booking' }, { status: 400 })
    }

    // Create review
    const { data: review, error: dbError } = await db
      .from('Review')
      .insert({
        id: crypto.randomUUID().replace(/-/g, '').slice(0, 25),
        bookingId,
        reviewerId: user.id,
        rating: Math.round(rating),
        comment: comment || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Create review error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Recalculate provider average rating
    if (booking.providerId) {
      const { data: reviews } = await db
        .from('Review')
        .select('rating, Booking!inner(providerId)')
        .eq('Booking.providerId', booking.providerId)

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        await db.from('User').update({
          rating: Math.round(avgRating * 10) / 10,
          updatedAt: new Date().toISOString(),
        }).eq('id', booking.providerId)
      }
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    const bookingId = searchParams.get('bookingId')

    if (bookingId) {
      const { data: review } = await db
        .from('Review')
        .select('*, reviewer:User!reviewerId(id, name, avatar)')
        .eq('bookingId', bookingId)
        .single()

      return NextResponse.json({ review })
    }

    if (providerId) {
      const { data: reviews } = await db
        .from('Review')
        .select('*, reviewer:User!reviewerId(id, name, avatar), Booking!inner(providerId)')
        .eq('Booking.providerId', providerId)
        .order('createdAt', { ascending: false })

      return NextResponse.json({ reviews: reviews || [] })
    }

    return NextResponse.json({ error: 'providerId or bookingId is required' }, { status: 400 })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
