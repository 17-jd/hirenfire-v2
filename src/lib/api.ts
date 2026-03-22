import { User, Booking, Service } from './store'

const API_BASE = '/api'

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Clear local auth state on 401
    const { useAppStore } = await import('./store')
    useAppStore.getState().logout()
    throw new Error('Not authenticated')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    email: string
    password: string
    name: string
    phone?: string
    role: string
    specialization?: string
    hourlyRate?: number
  }) =>
    fetchAPI<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchAPI<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () =>
    fetchAPI<{ user: User }>('/auth/me'),
}

// Bookings API
export const bookingsAPI = {
  create: (data: {
    serviceAddress: string
    serviceLat?: number
    serviceLng?: number
    serviceType: string
    description?: string
    scheduledDate?: string
    scheduledTime?: string
    hours?: number
  }) =>
    fetchAPI<{ booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () =>
    fetchAPI<{ bookings: Booking[] }>('/bookings'),

  getById: (id: string) =>
    fetchAPI<{ booking: Booking }>(`/bookings/${id}`),

  cancel: (id: string, reason?: string) =>
    fetchAPI<{ booking: Booking }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  accept: (id: string) =>
    fetchAPI<{ booking: Booking }>(`/bookings/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  start: (id: string) =>
    fetchAPI<{ booking: Booking }>(`/bookings/${id}/start`, {
      method: 'POST',
    }),

  complete: (id: string, otp: string) =>
    fetchAPI<{ booking: Booking }>(`/bookings/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  getPending: () =>
    fetchAPI<{ bookings: Booking[] }>('/bookings/pending'),

  generateOtp: (id: string) =>
    fetchAPI<{ otp: string }>(`/bookings/${id}/generate-otp`, {
      method: 'POST',
    }),
}

// Provider API
export const providerAPI = {
  getStats: () =>
    fetchAPI<any>('/provider/stats'),

  updateStatus: (isAvailable: boolean) =>
    fetchAPI<{ success: boolean }>('/provider/status', {
      method: 'POST',
      body: JSON.stringify({ isAvailable }),
    }),

  updateLocation: (latitude: number, longitude: number, heading?: number) =>
    fetchAPI<{ success: boolean }>('/provider/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, heading }),
    }),

  getServices: () =>
    fetchAPI<{ services: Service[] }>('/provider/services'),

  createService: (data: {
    serviceType: string
    title: string
    description?: string
    hourlyRate: number
  }) =>
    fetchAPI<{ service: Service }>('/provider/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Reviews API
export const reviewsAPI = {
  create: (data: { bookingId: string; rating: number; comment?: string }) =>
    fetchAPI<{ review: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByProvider: (providerId: string) =>
    fetchAPI<{ reviews: any[] }>(`/reviews?providerId=${providerId}`),

  getByBooking: (bookingId: string) =>
    fetchAPI<{ review: any }>(`/reviews?bookingId=${bookingId}`),
}

// Payment API
export const paymentAPI = {
  processPayment: (bookingId: string, method: string) =>
    fetchAPI<{ success: boolean; booking: Booking }>(`/bookings/${bookingId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    }),
}
