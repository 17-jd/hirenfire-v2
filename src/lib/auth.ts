import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from './session'
import { db } from './db'

export async function getAuthenticatedUser(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }), user: null }
  }

  const { data: user } = await db
    .from('User')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }), user: null }
  }

  return { error: null, user }
}
