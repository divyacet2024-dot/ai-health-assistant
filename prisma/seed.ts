import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding users...')

  const demoUsers = [
    {
      email: 'admin@aihealthassist.com',
      password: 'admin123',
      name: 'Admin',
      role: UserRole.ADMIN,
      phone: '9876543210'
    },
    {
      email: 'rahul@patient.com',
      password: 'pass123',
      name: 'Rahul Sharma',
      role: UserRole.PATIENT,
      phone: '9876543211'
    },
    {
      email: 'anil@doctor.com',
      password: 'pass123',
      name: 'Dr. Anil Mehta',
      role: UserRole.DOCTOR,
      phone: '9876543212'
    }
  ]

  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const totpSecret =
      userData.role === UserRole.ADMIN || userData.role === UserRole.DOCTOR
        ? speakeasy.generateSecret({ length: 20 }).base32
        : null

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        totpSecret
      }
    })

    console.log(`✅ ${userData.role}: ${userData.name}`)
  }

  console.log('🎉 Users seeded with hashed passwords + TOTP!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })