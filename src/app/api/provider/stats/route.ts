import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    if (user.role !== 'provider') {
      return NextResponse.json({ error: 'Only providers can view stats' }, { status: 403 })
    }

    // Get provider info
    const { data: providerInfo } = await db
      .from('ProviderInfo')
      .select('*')
      .eq('userId', user.id)
      .single()

    // Get all completed bookings for this provider
    const { data: completedBookings } = await db
      .from('Booking')
      .select('*')
      .eq('providerId', user.id)
      .eq('status', 'completed')
      .order('completedAt', { ascending: false })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

    const allCompleted = completedBookings || []

    // Calculate earnings
    const todayEarnings = allCompleted
      .filter((b: any) => b.completedAt && b.completedAt >= todayStart)
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)

    const weekEarnings = allCompleted
      .filter((b: any) => b.completedAt && b.completedAt >= weekStart)
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)

    const totalEarnings = providerInfo?.earnings || 0

    // Calculate hours
    const todayHours = allCompleted
      .filter((b: any) => b.completedAt && b.completedAt >= todayStart)
      .reduce((sum: number, b: any) => sum + (b.hours || 0), 0)

    const weekHours = allCompleted
      .filter((b: any) => b.completedAt && b.completedAt >= weekStart)
      .reduce((sum: number, b: any) => sum + (b.hours || 0), 0)

    const totalHours = allCompleted.reduce((sum: number, b: any) => sum + (b.hours || 0), 0)

    // Jobs count
    const todayJobs = allCompleted.filter((b: any) => b.completedAt && b.completedAt >= todayStart).length
    const weekJobs = allCompleted.filter((b: any) => b.completedAt && b.completedAt >= weekStart).length
    const totalJobs = providerInfo?.completedJobs || allCompleted.length

    // Recent jobs (last 10)
    const recentJobs = allCompleted.slice(0, 10).map((b: any) => ({
      id: b.id,
      serviceType: b.serviceType,
      totalAmount: b.totalAmount,
      hours: b.hours,
      completedAt: b.completedAt,
      serviceAddress: b.serviceAddress,
    }))

    // Get all bookings (any status) for this provider
    const { data: allBookings } = await db
      .from('Booking')
      .select('status')
      .eq('providerId', user.id)

    const statusCounts = {
      completed: allCompleted.length,
      cancelled: (allBookings || []).filter((b: any) => b.status === 'cancelled').length,
      in_progress: (allBookings || []).filter((b: any) => b.status === 'in_progress').length,
      accepted: (allBookings || []).filter((b: any) => b.status === 'accepted').length,
    }

    // Get reviews
    const { data: reviews } = await db
      .from('Review')
      .select('rating')
      .in('bookingId', allCompleted.map((b: any) => b.id))

    const ratingBreakdown = [0, 0, 0, 0, 0]
    ;(reviews || []).forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) ratingBreakdown[r.rating - 1]++
    })

    return NextResponse.json({
      earnings: { today: todayEarnings, week: weekEarnings, total: totalEarnings },
      hours: { today: todayHours, week: weekHours, total: totalHours },
      jobs: { today: todayJobs, week: weekJobs, total: totalJobs },
      rating: user.rating,
      totalReviews: (reviews || []).length,
      ratingBreakdown,
      statusCounts,
      recentJobs,
      specialization: providerInfo?.specialization,
      hourlyRate: providerInfo?.hourlyRate,
      isVerified: providerInfo?.isVerified,
    })
  } catch (error) {
    console.error('Provider stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
