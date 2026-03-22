import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await getAuthenticatedUser(request)
    if (error) return error

    if (user.role !== 'provider') {
      return NextResponse.json({ error: 'Only providers can update status' }, { status: 403 })
    }

    const { isAvailable } = await request.json()

    const { error: dbError } = await db
      .from('User')
      .update({ isAvailable, updatedAt: new Date().toISOString() })
      .eq('id', user.id)

    if (dbError) {
      console.error('Update provider status error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update provider status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
