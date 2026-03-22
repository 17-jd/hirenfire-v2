import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo customers
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      email: 'customer@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'John Customer',
      phone: '+1 555-0101',
      role: 'customer',
      rating: 4.8,
      totalJobs: 12,
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane@demo.com' },
    update: {},
    create: {
      email: 'jane@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Jane Smith',
      phone: '+1 555-0102',
      role: 'customer',
      rating: 4.9,
      totalJobs: 8,
    },
  })

  console.log('Created customers:', customer1.name, customer2.name)

  // Create demo providers (service professionals)
  const provider1 = await prisma.user.upsert({
    where: { email: 'electrician@demo.com' },
    update: {},
    create: {
      email: 'electrician@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Mike Sparks',
      phone: '+1 555-0201',
      role: 'provider',
      isAvailable: true,
      rating: 4.7,
      totalJobs: 156,
    },
  })

  const provider2 = await prisma.user.upsert({
    where: { email: 'tech@demo.com' },
    update: {},
    create: {
      email: 'tech@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Sarah Tech',
      phone: '+1 555-0202',
      role: 'provider',
      isAvailable: true,
      rating: 4.9,
      totalJobs: 89,
    },
  })

  const provider3 = await prisma.user.upsert({
    where: { email: 'ac@demo.com' },
    update: {},
    create: {
      email: 'ac@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Tom Cool',
      phone: '+1 555-0203',
      role: 'provider',
      isAvailable: true,
      rating: 4.8,
      totalJobs: 67,
    },
  })

  const provider4 = await prisma.user.upsert({
    where: { email: 'plumber@demo.com' },
    update: {},
    create: {
      email: 'plumber@demo.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Dave Pipes',
      phone: '+1 555-0204',
      role: 'provider',
      isAvailable: true,
      rating: 4.6,
      totalJobs: 203,
    },
  })

  console.log('Created providers:', provider1.name, provider2.name, provider3.name, provider4.name)

  // Create provider info
  await prisma.providerInfo.upsert({
    where: { userId: provider1.id },
    update: {},
    create: {
      userId: provider1.id,
      specialization: 'electrician',
      hourlyRate: 75,
      experience: 8,
      isVerified: true,
      earnings: 12500.00,
      completedJobs: 156,
      bio: 'Licensed electrician with 8 years of experience. Specializing in residential and commercial electrical work.',
    },
  })

  await prisma.providerInfo.upsert({
    where: { userId: provider2.id },
    update: {},
    create: {
      userId: provider2.id,
      specialization: 'tech_support',
      hourlyRate: 65,
      experience: 5,
      isVerified: true,
      earnings: 6500.00,
      completedJobs: 89,
      bio: 'IT professional specializing in computer repair, network setup, and smart home installations.',
    },
  })

  await prisma.providerInfo.upsert({
    where: { userId: provider3.id },
    update: {},
    create: {
      userId: provider3.id,
      specialization: 'ac_technician',
      hourlyRate: 80,
      experience: 10,
      isVerified: true,
      earnings: 8500.00,
      completedJobs: 67,
      bio: 'HVAC certified technician with expertise in AC installation, repair, and maintenance.',
    },
  })

  await prisma.providerInfo.upsert({
    where: { userId: provider4.id },
    update: {},
    create: {
      userId: provider4.id,
      specialization: 'plumbing',
      hourlyRate: 70,
      experience: 15,
      isVerified: true,
      earnings: 15000.00,
      completedJobs: 203,
      bio: 'Master plumber with 15 years experience. All plumbing services from repairs to installations.',
    },
  })

  // Create some demo bookings
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      providerId: provider1.id,
      serviceAddress: '123 Main Street, Apt 4B',
      serviceType: 'electrician',
      description: 'Install new ceiling fan in living room',
      status: 'completed',
      hours: 2,
      hourlyRate: 75,
      totalAmount: 150.00,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      providerId: provider4.id,
      serviceAddress: '456 Oak Avenue',
      serviceType: 'plumbing',
      description: 'Fix leaking kitchen faucet',
      status: 'completed',
      hours: 1.5,
      hourlyRate: 70,
      totalAmount: 105.00,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
    },
  })

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      serviceAddress: '789 Pine Road',
      serviceType: 'tech_support',
      description: 'WiFi not working after storm',
      status: 'pending',
      hours: 1,
      hourlyRate: 65,
      totalAmount: 65.00,
      paymentMethod: 'card',
      paymentStatus: 'pending',
    },
  })

  console.log('Created demo bookings')

  console.log('Database seeded successfully!')
  console.log('\n=== Demo Accounts ===')
  console.log('Customer: customer@demo.com / demo123')
  console.log('Electrician: electrician@demo.com / demo123')
  console.log('Tech Support: tech@demo.com / demo123')
  console.log('AC Technician: ac@demo.com / demo123')
  console.log('Plumber: plumber@demo.com / demo123')
  console.log('====================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
