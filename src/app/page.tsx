'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { authAPI, bookingsAPI, providerAPI, reviewsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Zap, Wrench, Fan, Droplets, MapPin, User, Star, Clock, DollarSign, 
  Phone, Menu, X, ArrowRight, CheckCircle,
  Shield, Users, Loader2, LogOut,
  Settings, History, Radio, Briefcase, Hammer
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Service types configuration
const SERVICE_TYPES = {
  electrician: {
    name: 'Electrician',
    icon: Zap,
    description: 'Electrical repairs, installations, and inspections',
    hourlyRate: 75,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  tech_support: {
    name: 'Tech Support',
    icon: Wrench,
    description: 'Computer repair, WiFi setup, device troubleshooting',
    hourlyRate: 65,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  ac_technician: {
    name: 'AC Technician',
    icon: Fan,
    description: 'AC repair, maintenance, and installation',
    hourlyRate: 80,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  plumbing: {
    name: 'Plumbing',
    icon: Droplets,
    description: 'Pipe repairs, drain cleaning, installations',
    hourlyRate: 70,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
} as const

type ServiceType = keyof typeof SERVICE_TYPES

// ============================================
// NAVIGATION COMPONENT
// ============================================
function Navigation() {
  const { user, isAuthenticated, currentView, setCurrentView, setShowAuthModal, setAuthMode, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      logout()
      toast({ title: 'Logged out successfully' })
    } catch {
      toast({ title: 'Logout failed', variant: 'destructive' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">HireNFire</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <>
                    <Button 
                      variant={currentView === 'booking' ? 'default' : 'ghost'}
                      onClick={() => setCurrentView('booking')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Book Service
                    </Button>
                    <Button 
                      variant={currentView === 'history' ? 'default' : 'ghost'}
                      onClick={() => setCurrentView('history')}
                    >
                      <History className="w-4 h-4 mr-2" />
                      My Bookings
                    </Button>
                  </>
                )}
                {user?.role === 'provider' && (
                  <Button 
                    variant={currentView === 'provider' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('provider')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Provider Dashboard
                  </Button>
                )}
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-3 bg-muted/50 rounded-full pl-1 pr-4 py-1">
                  <Avatar className="h-8 w-8 ring-2 ring-orange-500/30">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {user?.rating?.toFixed(1)}
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                        {user?.role === 'customer' ? 'Customer' : 'Provider'}
                      </Badge>
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-500">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true) }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{user?.name}</span>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Separator />
                {user?.role === 'customer' && (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('booking'); setMobileMenuOpen(false) }}>
                      <MapPin className="w-4 h-4 mr-2" /> Book Service
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('history'); setMobileMenuOpen(false) }}>
                      <History className="w-4 h-4 mr-2" /> My Bookings
                    </Button>
                  </>
                )}
                {user?.role === 'provider' && (
                  <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('provider'); setMobileMenuOpen(false) }}>
                    <Briefcase className="w-4 h-4 mr-2" /> Provider Dashboard
                  </Button>
                )}
                <Button variant="ghost" className="justify-start text-red-500" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="ghost" onClick={() => { setAuthMode('login'); setShowAuthModal(true); setMobileMenuOpen(false) }}>
                  Log in
                </Button>
                <Button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); setMobileMenuOpen(false) }}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

// ============================================
// AUTH MODAL COMPONENT
// ============================================
function AuthModal() {
  const { showAuthModal, authMode, setAuthMode, setShowAuthModal, setUser, setCurrentView } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'customer' | 'provider'>('customer')
  const [specialization, setSpecialization] = useState<ServiceType>('electrician')
  const [hourlyRate, setHourlyRate] = useState(70)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (authMode === 'login') {
        const { user } = await authAPI.login(email, password)
        setUser(user)
        setCurrentView(user.role === 'provider' ? 'provider' : 'booking')
        toast({ title: `Welcome back, ${user.name}!` })
      } else {
        const { user } = await authAPI.signup({
          email,
          password,
          name,
          phone,
          role,
          specialization: role === 'provider' ? specialization : undefined,
          hourlyRate: role === 'provider' ? hourlyRate : undefined,
        })
        setUser(user)
        setCurrentView(user.role === 'provider' ? 'provider' : 'booking')
        toast({ title: `Welcome to HireNFire, ${user.name}!` })
      }
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
      setName('')
      setPhone('')
    } catch (error) {
      toast({ 
        title: authMode === 'login' ? 'Login failed' : 'Signup failed', 
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {authMode === 'login' 
              ? 'Sign in to book services and manage your appointments' 
              : 'Join HireNFire to get started'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input 
                  id="signup-name" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone (optional)</Label>
                <Input 
                  id="signup-phone" 
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>I want to</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant={role === 'customer' ? 'default' : 'outline'}
                    onClick={() => setRole('customer')}
                    className="h-auto py-4"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <User className="w-5 h-5" />
                      <span>Hire Services</span>
                    </div>
                  </Button>
                  <Button 
                    type="button"
                    variant={role === 'provider' ? 'default' : 'outline'}
                    onClick={() => setRole('provider')}
                    className="h-auto py-4"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Hammer className="w-5 h-5" />
                      <span>Offer Services</span>
                    </div>
                  </Button>
                </div>
              </div>

              {role === 'provider' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <Label>Provider Details</Label>
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm">Specialization</Label>
                    <select 
                      id="specialization"
                      className="w-full p-2 border rounded-md bg-background"
                      value={specialization}
                      onChange={(e) => {
                        const s = e.target.value as ServiceType
                        setSpecialization(s)
                        setHourlyRate(SERVICE_TYPES[s].hourlyRate)
                      }}
                    >
                      {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-sm">Hourly Rate ($)</Label>
                    <Input 
                      id="hourlyRate" 
                      type="number"
                      min={20}
                      max={200}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Suggested: ${SERVICE_TYPES[specialization].hourlyRate}/hr</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// LANDING PAGE COMPONENT
// ============================================
function LandingPage() {
  const { setCurrentView, setShowAuthModal, setAuthMode, isAuthenticated, user } = useAppStore()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView(user?.role === 'provider' ? 'provider' : 'booking')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-orange-950/20 dark:via-background dark:to-red-950/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="text-sm px-4 py-1.5 bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Fast & Reliable Service
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Expert Home{' '}
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">Services</span>
                {' '}On Demand
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Book verified professionals for electrical, plumbing, AC repair, and tech support. Quality service, transparent pricing.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 h-12 px-8 text-base" onClick={handleGetStarted}>
                  {isAuthenticated ? 'Book a Service' : 'Get Started Free'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!isAuthenticated && (
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2" onClick={() => { setAuthMode('signup'); setShowAuthModal(true) }}>
                    <Hammer className="w-5 h-5 mr-2" />
                    Become a Provider
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="space-y-1">
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">50K+</p>
                  <p className="text-sm text-muted-foreground font-medium">Happy Customers</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">2K+</p>
                  <p className="text-sm text-muted-foreground font-medium">Service Providers</p>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">4.8</p>
                  <p className="text-sm text-muted-foreground font-medium">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-[2rem] rotate-3 scale-95" />
                <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-500/10 border border-orange-500/10 p-10">
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(SERVICE_TYPES).map(([key, service]) => {
                      const Icon = service.icon
                      return (
                        <div
                          key={key}
                          className="bg-background/90 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center gap-3 hover:scale-105 hover:shadow-xl transition-all duration-300 border border-border/50"
                        >
                          <div className={`w-14 h-14 ${service.bgColor} rounded-xl flex items-center justify-center`}>
                            <Icon className={`w-7 h-7 ${service.color}`} />
                          </div>
                          <span className="text-sm font-semibold">{service.name}</span>
                          <span className="text-xs text-muted-foreground">${service.hourlyRate}/hr</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Our Services</Badge>
            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Professional services at transparent hourly rates — no surprises, no hidden fees</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(SERVICE_TYPES).map(([key, service]) => {
              const Icon = service.icon
              return (
                <Card key={key} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-orange-500/20 overflow-hidden"
                  onClick={handleGetStarted}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-300" />
                  <CardHeader className="relative">
                    <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${service.hourlyRate}</span>
                      <span className="text-muted-foreground text-sm">/hour</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Starting rate</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Why Us</Badge>
            <h2 className="text-4xl font-bold mb-4">Why Choose HireNFire?</h2>
            <p className="text-lg text-muted-foreground">Built for trust, speed, and transparency</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-background/90 backdrop-blur hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Quick Booking</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Book a professional in minutes. Our smart matching finds available providers near you instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl bg-background/90 backdrop-blur hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Verified Professionals</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  All providers are background checked and reviewed. OTP-verified job completion for your safety.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl bg-background/90 backdrop-blur hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">Transparent Pricing</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Know the hourly rate upfront. No hidden fees, no surge pricing. Pay only for the time you use.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-60 h-60 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border-2 border-white rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of customers who trust HireNFire for their home service needs.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-xl h-14 px-10 text-lg font-semibold" onClick={handleGetStarted}>
            {isAuthenticated ? 'Book a Service Now' : 'Sign Up for Free'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

// ============================================
// BOOKING PAGE COMPONENT
// ============================================
function BookingPage() {
  const { currentBooking, setCurrentBooking, currentOtp, setCurrentOtp } = useAppStore()
  const [serviceAddress, setServiceAddress] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('electrician')
  const [description, setDescription] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [hours, setHours] = useState(1.5)
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])

  // Load booking history
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { bookings: data } = await bookingsAPI.getAll()
        setBookings(data)
      } catch (error) {
        console.error('Failed to load bookings:', error)
      }
    }
    loadBookings()
  }, [])

  const selectedService = SERVICE_TYPES[serviceType]
  const hourlyRate = selectedService.hourlyRate
  const totalAmount = hourlyRate * hours

  const handleBookService = async () => {
    if (!serviceAddress) {
      toast({ title: 'Please enter service address', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const { booking } = await bookingsAPI.create({
        serviceAddress,
        serviceType,
        description,
        scheduledTime,
        hours,
      })
      setCurrentBooking(booking)
      toast({ title: 'Service requested! Finding a provider...' })
    } catch (error) {
      toast({ 
        title: 'Failed to book service', 
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Poll for booking updates
  useEffect(() => {
    if (!currentBooking || currentBooking.status === 'completed' || currentBooking.status === 'cancelled') return

    const poll = setInterval(async () => {
      try {
        const { bookings: allBookings } = await bookingsAPI.getAll()
        const updatedBooking = allBookings.find((b: any) => b.id === currentBooking.id)
        if (updatedBooking && updatedBooking.status !== currentBooking.status) {
          setCurrentBooking(updatedBooking)
          if (updatedBooking.status === 'accepted') {
            toast({ title: 'Provider found! They are on their way.' })
          } else if (updatedBooking.status === 'in_progress') {
            toast({ title: 'Your service has started!' })
          } else if (updatedBooking.status === 'completed') {
            setCurrentOtp(null)
            toast({ title: 'Service completed! Go to Booking History to leave a review.' })
          }
        }
      } catch (error) {
        console.error('Poll error:', error)
      }
    }, 3000)

    return () => clearInterval(poll)
  }, [currentBooking, setCurrentBooking])

  // Auto-generate OTP when status becomes in_progress
  useEffect(() => {
    if (currentBooking?.status === 'in_progress' && !currentOtp) {
      bookingsAPI.generateOtp(currentBooking.id).then(({ otp }) => {
        setCurrentOtp(otp)
      }).catch(() => {})
    }
  }, [currentBooking?.status])

  const [customerReviewRating, setCustomerReviewRating] = useState(0)
  const [customerReviewComment, setCustomerReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewHover, setReviewHover] = useState(0)

  // Active booking view — full lifecycle tracker
  if (currentBooking) {
    const activeService = SERVICE_TYPES[currentBooking.serviceType as ServiceType]
    const ActiveIcon = activeService?.icon || Zap
    const status = currentBooking.status

    const steps = [
      { key: 'pending', label: 'Finding', icon: Users },
      { key: 'accepted', label: 'Accepted', icon: CheckCircle },
      { key: 'in_progress', label: 'Working', icon: Wrench },
      { key: 'completed', label: 'Done', icon: Star },
    ]
    const statusOrder = ['pending', 'accepted', 'in_progress', 'completed']
    const currentStep = statusOrder.indexOf(status)
    const isCancelled = status === 'cancelled'

    return (
      <div className="pt-20 pb-8 px-4 min-h-screen bg-muted/30">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status Tracker */}
          <Card className="overflow-hidden">
            <div className={`p-6 ${isCancelled ? 'bg-red-500/10' : status === 'completed' ? 'bg-green-500/10' : 'bg-gradient-to-r from-orange-500/10 to-red-500/10'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${activeService?.bgColor} rounded-xl flex items-center justify-center`}>
                    <ActiveIcon className={`w-6 h-6 ${activeService?.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activeService?.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentBooking.serviceAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${currentBooking.totalAmount}</p>
                  <p className="text-xs text-muted-foreground">{currentBooking.hours}h @ ${currentBooking.hourlyRate}/hr</p>
                </div>
              </div>

              {/* Step Progress Bar */}
              {!isCancelled && (
                <div className="flex items-center justify-between">
                  {steps.map((step, i) => {
                    const StepIcon = step.icon
                    const isActive = i === currentStep
                    const isDone = i < currentStep
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className="flex items-center w-full">
                          {i > 0 && (
                            <div className={`flex-1 h-1 rounded-full ${isDone || isActive ? 'bg-orange-500' : 'bg-muted-foreground/20'}`} />
                          )}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone ? 'bg-orange-500 text-white' :
                            isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? <CheckCircle className="w-5 h-5" /> : <StepIcon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-1 rounded-full ${isDone ? 'bg-orange-500' : 'bg-muted-foreground/20'}`} />
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-orange-500' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {isCancelled && (
                <div className="text-center py-2">
                  <Badge variant="destructive" className="text-sm">Cancelled</Badge>
                  {currentBooking.cancelReason && <p className="text-sm text-muted-foreground mt-2">{currentBooking.cancelReason}</p>}
                </div>
              )}
            </div>
          </Card>

          {/* Provider Card — shows after acceptance */}
          {currentBooking.provider && (
            <Card className="border-2 border-green-500/20">
              <CardContent className="p-5">
                <p className="text-xs text-green-600 font-medium mb-3 uppercase tracking-wider">Your Provider</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-green-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">{currentBooking.provider.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{currentBooking.provider.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{currentBooking.provider.rating?.toFixed(1)}</span>
                        <span className="text-muted-foreground">• {currentBooking.provider.totalJobs || 0} jobs</span>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="outline" className="h-12 w-12 rounded-full">
                    <Phone className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending — searching animation */}
          {status === 'pending' && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-orange-500 mb-4" />
                <p className="font-semibold text-lg">Finding a provider near you...</p>
                <p className="text-sm text-muted-foreground mt-1">This usually takes less than a minute</p>
                <Button
                  variant="destructive"
                  className="mt-6"
                  onClick={async () => {
                    try {
                      await bookingsAPI.cancel(currentBooking.id)
                      setCurrentBooking(null)
                      toast({ title: 'Booking cancelled' })
                    } catch {
                      toast({ title: 'Failed to cancel booking', variant: 'destructive' })
                    }
                  }}
                >
                  Cancel Request
                </Button>
              </CardContent>
            </Card>
          )}

          {/* OTP Card — auto-shown when in_progress */}
          {status === 'in_progress' && (
            <Card className="border-2 border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/10">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 mx-auto text-orange-500 mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-2">Completion OTP</p>
                {currentOtp ? (
                  <>
                    <p className="text-5xl font-bold tracking-[0.5em] text-orange-500 my-4">{currentOtp}</p>
                    <p className="text-sm text-muted-foreground">Share this code with your provider when the job is done</p>
                  </>
                ) : (
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-orange-500" />
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          {currentBooking.description && !isCancelled && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">Job Details</p>
                <p className="text-sm">{currentBooking.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Completed — Review Form */}
          {status === 'completed' && !reviewSubmitted && (
            <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/10">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="font-bold text-lg">Job Completed!</h3>
                  <p className="text-sm text-muted-foreground">How was your experience?</p>
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCustomerReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      className="p-1"
                    >
                      <Star className={`w-8 h-8 transition-colors ${
                        star <= (reviewHover || customerReviewRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Tell us about your experience (optional)"
                  value={customerReviewComment}
                  onChange={(e) => setCustomerReviewComment(e.target.value)}
                  rows={3}
                  className="mb-4"
                />
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  disabled={customerReviewRating === 0}
                  onClick={async () => {
                    try {
                      await reviewsAPI.create({
                        bookingId: currentBooking.id,
                        rating: customerReviewRating,
                        comment: customerReviewComment || undefined,
                      })
                      setReviewSubmitted(true)
                      toast({ title: 'Review submitted! Thank you.' })
                    } catch (err: any) {
                      toast({ title: err.message || 'Failed to submit review', variant: 'destructive' })
                    }
                  }}
                >
                  Submit Review
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={() => { setCurrentBooking(null); setCurrentOtp(null) }}>
                  Skip & Go Home
                </Button>
              </CardContent>
            </Card>
          )}

          {/* After review submitted */}
          {status === 'completed' && reviewSubmitted && (
            <Card className="border-2 border-green-500/20">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg">Thank you!</h3>
                <p className="text-sm text-muted-foreground mb-4">Your review helps our providers improve</p>
                <Button onClick={() => { setCurrentBooking(null); setCurrentOtp(null); setReviewSubmitted(false) }}>
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <Card>
              <CardContent className="p-6 text-center">
                <Button onClick={() => { setCurrentBooking(null) }}>
                  Book Another Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book a Service</CardTitle>
                <CardDescription>What do you need help with?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Input */}
                <div className="space-y-2">
                  <Label>Service Address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder="Enter your address"
                      className="pl-10"
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Service Type Selection */}
                <div className="space-y-3">
                  <Label>Select service type</Label>
                  <div className="space-y-2">
                    {Object.entries(SERVICE_TYPES).map(([key, service]) => {
                      const Icon = service.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setServiceType(key as ServiceType)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            serviceType === key 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                serviceType === key ? 'bg-primary text-primary-foreground' : service.bgColor
                              }`}>
                                <Icon className={`w-5 h-5 ${serviceType === key ? '' : service.color}`} />
                              </div>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-xs text-muted-foreground">{service.description.slice(0, 40)}...</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${service.hourlyRate}</p>
                              <p className="text-xs text-muted-foreground">/hour</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Problem Description (optional)</Label>
                  <Textarea
                    placeholder="Describe your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Estimated Hours */}
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={0.5}
                      max={8}
                      step={0.5}
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">hours</span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Total</p>
                      <p className="text-xs text-muted-foreground">${hourlyRate}/hr × {hours} hrs</p>
                    </div>
                    <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBookService}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Request Service
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[300px] overflow-hidden">
              <div className="h-full bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Enter your address to get started</p>
                </div>
              </div>
            </Card>

            {/* Recent Bookings */}
            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3 pr-4">
                      {bookings.slice(0, 5).map((booking) => {
                        const service = SERVICE_TYPES[booking.serviceType as ServiceType]
                        const Icon = service?.icon || Zap
                        return (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${service?.bgColor} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${service?.color}`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{service?.name}</p>
                                <p className="text-xs text-muted-foreground">{booking.serviceAddress}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${booking.totalAmount}</p>
                              <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PROVIDER DASHBOARD COMPONENT
// ============================================
function ProviderDashboard() {
  const { user, isOnline, setIsOnline, pendingBookings, setPendingBookings, currentBooking, setCurrentBooking } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [earnings, setEarnings] = useState({ today: 0, week: 0, total: 0 })
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Load real stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await providerAPI.getStats()
        setStats(data)
        setEarnings(data.earnings)
      } catch (err) {
        console.error('Failed to load stats:', err)
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [])

  // Load pending bookings
  const loadPendingBookings = useCallback(async () => {
    try {
      const { bookings } = await bookingsAPI.getPending()
      setPendingBookings(bookings)
    } catch (error) {
      console.error('Failed to load pending bookings:', error)
    }
  }, [setPendingBookings])

  useEffect(() => {
    if (isOnline) {
      loadPendingBookings()
      const interval = setInterval(loadPendingBookings, 5000)
      return () => clearInterval(interval)
    }
  }, [isOnline, loadPendingBookings])

  const toggleOnline = async () => {
    setLoading(true)
    try {
      await providerAPI.updateStatus(!isOnline)
      setIsOnline(!isOnline)
      toast({ 
        title: isOnline ? 'You are now offline' : 'You are now online!',
        description: isOnline ? 'You will stop receiving job requests.' : 'You will receive job requests.'
      })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const acceptBooking = async (bookingId: string) => {
    try {
      const { booking } = await bookingsAPI.accept(bookingId)
      setCurrentBooking(booking)
      setPendingBookings(pendingBookings.filter(b => b.id !== bookingId))
      toast({ title: 'Job accepted! Navigate to service location.' })
    } catch {
      toast({ title: 'Failed to accept job', variant: 'destructive' })
    }
  }

  const startJob = async () => {
    if (!currentBooking) return
    try {
      const { booking } = await bookingsAPI.start(currentBooking.id)
      setCurrentBooking(booking)
      toast({ title: 'Job started!' })
    } catch {
      toast({ title: 'Failed to start job', variant: 'destructive' })
    }
  }

  const [otpInput, setOtpInput] = useState('')

  const completeJob = async () => {
    if (!currentBooking) return
    if (!otpInput || otpInput.length !== 6) {
      toast({ title: 'Please enter the 6-digit OTP from the customer', variant: 'destructive' })
      return
    }
    try {
      const { booking } = await bookingsAPI.complete(currentBooking.id, otpInput)
      setCurrentBooking(booking)
      setOtpInput('')
      setEarnings(prev => ({ ...prev, today: prev.today + booking.totalAmount }))
      toast({ title: `Job completed! Earned $${booking.totalAmount}` })
    } catch (err: any) {
      toast({ title: err.message || 'Failed to complete job', variant: 'destructive' })
    }
  }

  // Active booking view for provider — streamlined flow
  if (currentBooking && !['completed', 'cancelled'].includes(currentBooking.status)) {
    const activeService = SERVICE_TYPES[currentBooking.serviceType as ServiceType]
    const ActiveIcon = activeService?.icon || Zap
    const isAccepted = currentBooking.status === 'accepted'
    const isWorking = currentBooking.status === 'in_progress'

    return (
      <div className="pt-20 pb-8 px-4 min-h-screen bg-muted/30">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status Banner */}
          <Card className={`border-2 overflow-hidden ${isAccepted ? 'border-blue-500/30' : 'border-orange-500/30'}`}>
            <div className={`p-6 ${isAccepted ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white`}>
              <div className="flex items-center gap-4">
                {isAccepted ? (
                  <MapPin className="w-10 h-10 flex-shrink-0" />
                ) : (
                  <ActiveIcon className="w-10 h-10 flex-shrink-0 animate-pulse" />
                )}
                <div>
                  <h3 className="font-bold text-xl">
                    {isAccepted ? 'Navigate to Customer' : 'Service in Progress'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {isAccepted ? 'Head to the service location and start the job' : `Estimated ${currentBooking.hours} hours`}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-5">
              {/* Earnings */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-xl mb-4">
                <span className="text-sm font-medium text-muted-foreground">You'll earn</span>
                <span className="text-2xl font-bold text-green-600">${currentBooking.totalAmount}</span>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">{currentBooking.customer?.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{currentBooking.customer?.name || 'Customer'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{currentBooking.customer?.rating?.toFixed(1) || '5.0'}</span>
                    <span>•</span>
                    <span>{activeService?.name}</span>
                  </div>
                </div>
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Service Location</p>
                  <p className="font-medium text-sm">{currentBooking.serviceAddress}</p>
                </div>
              </div>

              {currentBooking.description && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                  <Wrench className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Problem</p>
                    <p className="font-medium text-sm">{currentBooking.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardContent className="p-5">
              {isAccepted && (
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg" onClick={startJob}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I've Arrived — Start Job
                </Button>
              )}
              {isWorking && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Enter customer's OTP to finish</p>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-3xl tracking-[0.5em] font-bold h-14"
                      maxLength={6}
                    />
                  </div>
                  <Button className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg" onClick={completeJob} disabled={otpInput.length !== 6}>
                    <Shield className="w-5 h-5 mr-2" />
                    Verify & Complete Job
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full mt-3 text-muted-foreground"
                onClick={async () => {
                  try {
                    await bookingsAPI.cancel(currentBooking.id)
                    setCurrentBooking(null)
                    toast({ title: 'Job cancelled' })
                  } catch {
                    toast({ title: 'Failed to cancel job', variant: 'destructive' })
                  }
                }}
              >
                Cancel Job
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Status Bar */}
        <Card className={`mb-6 border-2 ${isOnline ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/10' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isOnline ? 'bg-green-500 shadow-lg shadow-green-500/30 animate-pulse' : 'bg-muted'
                }`}>
                  <Radio className={`w-7 h-7 ${isOnline ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-bold text-xl">
                    {isOnline ? 'You are Online' : 'You are Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Accepting job requests' : 'Go online to start earning'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="online-toggle" className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </Label>
                <Switch
                  id="online-toggle"
                  checked={isOnline}
                  onCheckedChange={toggleOnline}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Overview - Uber Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70 font-medium">Today</span>
              </div>
              <p className="text-3xl font-bold">${earnings.today.toFixed(0)}</p>
              <p className="text-xs text-white/60 mt-1">{stats?.jobs?.today || 0} jobs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70 font-medium">This Week</span>
              </div>
              <p className="text-3xl font-bold">${earnings.week.toFixed(0)}</p>
              <p className="text-xs text-white/60 mt-1">{stats?.jobs?.week || 0} jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Hours This Week</span>
              </div>
              <p className="text-3xl font-bold">{(stats?.hours?.week || 0).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{(stats?.hours?.total || 0).toFixed(0)} total hrs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground font-medium">Rating</span>
              </div>
              <p className="text-3xl font-bold">{(user?.rating || 5.0).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats?.totalReviews || 0} reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Job Requests
                  {pendingBookings.length > 0 && (
                    <Badge className="ml-2 bg-orange-500">{pendingBookings.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isOnline ? 'New job requests will appear here' : 'Go online to receive job requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isOnline ? (
                  <div className="text-center py-12">
                    <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You are currently offline</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Toggle online to start receiving job requests
                    </p>
                  </div>
                ) : pendingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No job requests at the moment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stay online to receive new requests
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <div className="space-y-3 pr-4">
                      {pendingBookings.map((booking) => {
                        const service = SERVICE_TYPES[booking.serviceType as ServiceType]
                        const Icon = service?.icon || Zap
                        return (
                          <Card key={booking.id} className="p-4 border-2 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${service?.bgColor} rounded-lg flex items-center justify-center`}>
                                  <Icon className={`w-5 h-5 ${service?.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{service?.name}</p>
                                  <p className="text-sm text-muted-foreground">{booking.hours} hrs</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">${booking.totalAmount}</p>
                                <p className="text-xs text-muted-foreground">${booking.hourlyRate}/hr</p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.serviceAddress}</span>
                              </div>
                              {booking.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{booking.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" onClick={() => acceptBooking(booking.id)}>
                                Accept
                              </Button>
                              <Button variant="outline" className="flex-1" onClick={() => setPendingBookings(pendingBookings.filter(b => b.id !== booking.id))}>
                                Decline
                              </Button>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            {stats?.recentJobs && stats.recentJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Completed Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentJobs.map((job: any) => {
                      const service = SERVICE_TYPES[job.serviceType as ServiceType]
                      const Icon = service?.icon || Zap
                      return (
                        <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 ${service?.bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${service?.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{service?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : ''} · {job.hours}h
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-green-600">+${job.totalAmount}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Total Earnings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lifetime Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Earnings</span>
                  <span className="font-bold text-lg">${earnings.total.toFixed(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Jobs Completed</span>
                  <span className="font-bold text-lg">{stats?.jobs?.total || user?.totalJobs || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Total Hours</span>
                  <span className="font-bold text-lg">{(stats?.hours?.total || 0).toFixed(0)}h</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Avg Rating</span>
                  <span className="font-bold text-lg">{(user?.rating || 5.0).toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rating Breakdown */}
            {stats?.ratingBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingBreakdown[star - 1] || 0
                    const total = stats.totalReviews || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-6 text-right">{star}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{count}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Profile Card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{stats?.specialization || 'Provider'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>${stats?.hourlyRate || 70}/hr rate</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// BOOKING HISTORY COMPONENT
// ============================================
function ReviewForm({ bookingId, onSubmitted }: { bookingId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await reviewsAPI.create({ bookingId, rating, comment: comment || undefined })
      toast({ title: 'Review submitted! Thank you.' })
      onSubmitted()
    } catch (err: any) {
      toast({ title: err.message || 'Failed to submit review', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      <p className="text-sm font-medium">Rate this service</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <Button size="sm" onClick={handleSubmit} disabled={submitting || rating === 0}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
        Submit Review
      </Button>
    </div>
  )
}

function BookingHistory() {
  const { user } = useAppStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { bookings: data } = await bookingsAPI.getAll()
        setBookings(data)
      } catch (error) {
        console.error('Failed to load bookings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>Your recent service bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Book your first service to get started
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {bookings.map((booking) => {
                    const service = SERVICE_TYPES[booking.serviceType as ServiceType]
                    const Icon = service?.icon || Zap
                    return (
                      <Card key={booking.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${service?.bgColor} rounded-lg flex items-center justify-center ${
                              booking.status === 'completed' ? '' : 'opacity-50'
                            }`}>
                              <Icon className={`w-5 h-5 ${service?.color}`} />
                            </div>
                            <div>
                              <p className="font-medium">{service?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${booking.totalAmount}</p>
                            <Badge variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'cancelled' ? 'destructive' : 'secondary'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.serviceAddress}</span>
                        </div>
                        {booking.provider && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{booking.provider.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{booking.provider.name}</span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {booking.provider.rating?.toFixed(1)}
                            </div>
                          </div>
                        )}
                        {booking.status === 'completed' && user?.role === 'customer' && !reviewedBookings.has(booking.id) && (
                          <ReviewForm
                            bookingId={booking.id}
                            onSubmitted={() => setReviewedBookings(prev => new Set([...prev, booking.id]))}
                          />
                        )}
                        {reviewedBookings.has(booking.id) && (
                          <div className="mt-3 pt-3 border-t text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Review submitted
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// FOOTER COMPONENT
// ============================================
function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">HireNFire</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Expert home services on demand. Available 24/7 in your area.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-foreground">Electrician</button></li>
              <li><button className="hover:text-foreground">Tech Support</button></li>
              <li><button className="hover:text-foreground">AC Technician</button></li>
              <li><button className="hover:text-foreground">Plumbing</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-foreground">About Us</button></li>
              <li><button className="hover:text-foreground">Careers</button></li>
              <li><button className="hover:text-foreground">Blog</button></li>
              <li><button className="hover:text-foreground">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-foreground">Help Center</button></li>
              <li><button className="hover:text-foreground">Safety</button></li>
              <li><button className="hover:text-foreground">Terms</button></li>
              <li><button className="hover:text-foreground">Privacy</button></li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col md:flex-row justify-between items-center pt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 HireNFire. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const { currentView, setUser } = useAppStore()

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await authAPI.me()
        setUser(user)
      } catch {
        setUser(null)
      }
    }
    checkAuth()
  }, [setUser])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <AuthModal />
      <main className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'booking' && <BookingPage />}
        {currentView === 'provider' && <ProviderDashboard />}
        {currentView === 'history' && <BookingHistory />}
      </main>
      <Footer />
    </div>
  )
}
