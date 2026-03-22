import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null
}

export function setSessionCookie(response: NextResponse, userId: string): NextResponse {
  response.cookies.set(COOKIE_NAME, userId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge: MAX_AGE,
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge: 0,
  })
  return response
}
