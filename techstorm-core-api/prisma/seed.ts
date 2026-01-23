import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@techstorm.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@techstorm.com',
      name: 'System Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created: admin@techstorm.com / admin123');

  const mentorPassword = await bcrypt.hash('mentor123', 10);
  await prisma.user.upsert({
    where: { email: 'mentor@techstorm.com' },
    update: { role: 'MENTOR' },
    create: {
      email: 'mentor@techstorm.com',
      name: 'Dr. Alan Turing',
      password: mentorPassword,
      role: 'MENTOR',
    },
  });
  console.log('✅ Mentor created: mentor@techstorm.com / mentor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
