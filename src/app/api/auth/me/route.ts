import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest, clearSessionCookie } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: user } = await db
      .from('User')
      .select('id, email, name, phone, avatar, role, isAvailable, rating, totalJobs, createdAt, updatedAt')
      .eq('id', userId)
      .single()

    if (!user) {
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      clearSessionCookie(response)
      return response
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
