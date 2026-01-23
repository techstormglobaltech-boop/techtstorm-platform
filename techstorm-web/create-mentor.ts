import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('mentor123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'mentor@techstorm.com' },
    update: {
        role: 'MENTOR'
    },
    create: {
      email: 'mentor@techstorm.com',
      name: 'Dr. Alan Turing',
      password: hashedPassword,
      role: 'MENTOR',
    },
  })
  
  console.log('✅ Mentor created/updated successfully:')
  console.log('📧 Email: mentor@techstorm.com')
  console.log('🔑 Password: mentor123')
}

main()
  .catch((e) => {
    console.error('❌ Error creating mentor:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
