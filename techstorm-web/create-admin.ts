import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@techstorm.com' },
    update: {
        role: 'ADMIN'
    },
    create: {
      email: 'admin@techstorm.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created/updated successfully:', user.email)
  console.log('📧 Email: admin@techstorm.com')
  console.log('🔑 Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
