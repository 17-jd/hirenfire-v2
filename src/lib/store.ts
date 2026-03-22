import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: 'customer' | 'provider'
  isAvailable?: boolean
  rating: number
  totalJobs: number
}

export interface Service {
  id: string
  providerId: string
  serviceType: string
  title: string
  description?: string
  hourlyRate: number
}

export interface Booking {
  id: string
  customerId: string
  providerId?: string
  serviceId?: string
  serviceAddress: string
  serviceLat?: number
  serviceLng?: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  serviceType: 'electrician' | 'tech_support' | 'ac_technician' | 'plumbing'
  description?: string
  scheduledDate?: string
  scheduledTime?: string
  hours: number
  hourlyRate: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  requestedAt: string
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
  provider?: User
  customer?: User
}

export interface ProviderLocation {
  latitude: number
  longitude: number
  heading?: number
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  rating: number
  comment?: string
  createdAt: string
  reviewer?: { id: string; name: string; avatar?: string }
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // UI state
  currentView: 'landing' | 'booking' | 'provider' | 'history' | 'profile'
  showAuthModal: boolean
  authMode: 'login' | 'signup'
  
  // Booking state
  currentBooking: Booking | null
  bookings: Booking[]
  
  // Provider state
  services: Service[]
  providerLocation: ProviderLocation | null
  isOnline: boolean
  pendingBookings: Booking[]

  // OTP state
  currentOtp: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setCurrentView: (view: AppState['currentView']) => void
  setShowAuthModal: (show: boolean) => void
  setAuthMode: (mode: 'login' | 'signup') => void
  setCurrentBooking: (booking: Booking | null) => void
  setBookings: (bookings: Booking[]) => void
  setServices: (services: Service[]) => void
  setProviderLocation: (location: ProviderLocation | null) => void
  setIsOnline: (online: boolean) => void
  setPendingBookings: (bookings: Booking[]) => void
  setCurrentOtp: (otp: string | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  currentView: 'landing',
  showAuthModal: false,
  authMode: 'login',
  currentBooking: null,
  bookings: [],
  services: [],
  providerLocation: null,
  isOnline: false,
  pendingBookings: [],
  currentOtp: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentView: (currentView) => set({ currentView }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
  setAuthMode: (authMode) => set({ authMode }),
  setCurrentBooking: (currentBooking) => set({ currentBooking }),
  setBookings: (bookings) => set({ bookings }),
  setServices: (services) => set({ services }),
  setProviderLocation: (providerLocation) => set({ providerLocation }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setPendingBookings: (pendingBookings) => set({ pendingBookings }),
  setCurrentOtp: (currentOtp) => set({ currentOtp }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    currentView: 'landing',
    currentBooking: null,
    bookings: [],
    services: [],
    providerLocation: null,
    isOnline: false,
    pendingBookings: [],
    currentOtp: null,
  }),
}))
