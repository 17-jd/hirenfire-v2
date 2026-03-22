import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Types
interface DriverLocation {
  latitude: number
  longitude: number
  heading?: number
  speed?: number
}

interface RideUpdate {
  rideId: string
  status: string
  driver?: DriverInfo
  driverLocation?: DriverLocation
}

interface DriverInfo {
  id: string
  name: string
  rating: number
  vehicle?: VehicleInfo
}

interface VehicleInfo {
  make: string
  model: string
  color: string
  plateNumber: string
}

interface RiderInfo {
  id: string
  socketId: string
}

interface DriverData {
  id: string
  socketId: string
  location: DriverLocation
  isAvailable: boolean
  currentRideId?: string
}

// In-memory storage
const riders = new Map<string, RiderInfo>()
const drivers = new Map<string, DriverData>()
const rideRooms = new Map<string, Set<string>>() // rideId -> set of socketIds

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9)

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`)

  // ============ RIDER EVENTS ============
  
  // Rider joins
  socket.on('rider:join', (data: { riderId: string }) => {
    riders.set(data.riderId, {
      id: data.riderId,
      socketId: socket.id,
    })
    console.log(`Rider joined: ${data.riderId}`)
    socket.emit('rider:joined', { success: true })
  })

  // Rider requests a ride
  socket.on('rider:request-ride', (data: { rideId: string }) => {
    const roomName = `ride:${data.rideId}`
    socket.join(roomName)
    
    if (!rideRooms.has(data.rideId)) {
      rideRooms.set(data.rideId, new Set())
    }
    rideRooms.get(data.rideId)!.add(socket.id)
    
    console.log(`Ride requested: ${data.rideId}`)
    
    // Notify all available drivers
    io.emit('driver:new-ride', { rideId: data.rideId })
  })

  // Rider subscribes to ride updates
  socket.on('rider:subscribe-ride', (data: { rideId: string }) => {
    const roomName = `ride:${data.rideId}`
    socket.join(roomName)
    console.log(`Client subscribed to ride: ${data.rideId}`)
  })

  // ============ DRIVER EVENTS ============
  
  // Driver goes online
  socket.on('driver:online', (data: { driverId: string }) => {
    drivers.set(data.driverId, {
      id: data.driverId,
      socketId: socket.id,
      location: { latitude: 0, longitude: 0 },
      isAvailable: true,
    })
    console.log(`Driver online: ${data.driverId}`)
    socket.emit('driver:online-confirmed', { success: true })
  })

  // Driver goes offline
  socket.on('driver:offline', (data: { driverId: string }) => {
    const driver = drivers.get(data.driverId)
    if (driver) {
      driver.isAvailable = false
    }
    console.log(`Driver offline: ${data.driverId}`)
  })

  // Driver updates location
  socket.on('driver:location-update', (data: {
    driverId: string
    location: DriverLocation
    rideId?: string
  }) => {
    const driver = drivers.get(data.driverId)
    if (driver) {
      driver.location = data.location
    }

    // If driver is on a ride, emit location to rider
    if (data.rideId) {
      const roomName = `ride:${data.rideId}`
      io.to(roomName).emit('ride:driver-location', {
        driverId: data.driverId,
        location: data.location,
      })
    }
  })

  // Driver accepts a ride
  socket.on('driver:accept-ride', (data: {
    rideId: string
    driverId: string
    driverInfo: DriverInfo
  }) => {
    const roomName = `ride:${data.rideId}`
    
    // Update driver status
    const driver = drivers.get(data.driverId)
    if (driver) {
      driver.isAvailable = false
      driver.currentRideId = data.rideId
    }

    // Notify rider
    io.to(roomName).emit('ride:accepted', {
      rideId: data.rideId,
      driver: data.driverInfo,
    })
    
    console.log(`Ride ${data.rideId} accepted by driver ${data.driverId}`)
  })

  // Driver arrives at pickup
  socket.on('driver:arrived', (data: { rideId: string }) => {
    const roomName = `ride:${data.rideId}`
    io.to(roomName).emit('ride:driver-arrived', { rideId: data.rideId })
    console.log(`Driver arrived for ride: ${data.rideId}`)
  })

  // Driver starts trip
  socket.on('driver:start-trip', (data: { rideId: string }) => {
    const roomName = `ride:${data.rideId}`
    io.to(roomName).emit('ride:started', { rideId: data.rideId })
    console.log(`Ride started: ${data.rideId}`)
  })

  // Driver completes trip
  socket.on('driver:complete-trip', (data: { rideId: string }) => {
    const roomName = `ride:${data.rideId}`
    io.to(roomName).emit('ride:completed', { rideId: data.rideId })
    
    // Clean up
    rideRooms.delete(data.rideId)
    
    console.log(`Ride completed: ${data.rideId}`)
  })

  // ============ RIDE EVENTS ============
  
  // Cancel ride
  socket.on('ride:cancel', (data: { rideId: string; reason?: string }) => {
    const roomName = `ride:${data.rideId}`
    io.to(roomName).emit('ride:cancelled', {
      rideId: data.rideId,
      reason: data.reason,
    })
    
    rideRooms.delete(data.rideId)
    console.log(`Ride cancelled: ${data.rideId}`)
  })

  // ============ DISCONNECT ============
  
  socket.on('disconnect', () => {
    // Remove rider
    for (const [riderId, rider] of riders.entries()) {
      if (rider.socketId === socket.id) {
        riders.delete(riderId)
        console.log(`Rider disconnected: ${riderId}`)
        break
      }
    }

    // Remove driver
    for (const [driverId, driver] of drivers.entries()) {
      if (driver.socketId === socket.id) {
        drivers.delete(driverId)
        console.log(`Driver disconnected: ${driverId}`)
        
        // Notify any active rides
        if (driver.currentRideId) {
          const roomName = `ride:${driver.currentRideId}`
          io.to(roomName).emit('ride:driver-disconnected', {
            driverId,
            rideId: driver.currentRideId,
          })
        }
        break
      }
    }

    console.log(`Client disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Ride Tracking WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Ride Tracking WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Ride Tracking WebSocket server closed')
    process.exit(0)
  })
})
