import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { setSessionCookie } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, role, specialization, hourlyRate } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const { data: existingUser } = await db
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 25)

    const { data: user, error: userError } = await db
      .from('User')
      .insert({
        id,
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: role || 'customer',
        isAvailable: false,
        rating: 5.0,
        totalJobs: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    if (role === 'provider') {
      await db.from('ProviderInfo').insert({
        id: crypto.randomUUID().replace(/-/g, '').slice(0, 25),
        userId: user.id,
        specialization: specialization || 'electrician',
        hourlyRate: hourlyRate || 70,
        experience: 0,
        isVerified: false,
        earnings: 0,
        completedJobs: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    const { password: _, ...userWithoutPassword } = user
    const response = NextResponse.json({ user: userWithoutPassword })
    setSessionCookie(response, user.id)
    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
