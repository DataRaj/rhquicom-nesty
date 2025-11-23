import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Prisma Seed
 * 
 * 데이터베이스 초기 데이터를 생성합니다.
 * - 관리자 계정 생성
 * - 테스트 사용자 생성
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  // Admin 사용자 생성
  const adminPassword = await bcrypt.hash('admin123!@#', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nestjs-boilerplate.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@nestjs-boilerplate.com',
      isEmailVerified: true,
      role: Role.Admin,
      firstName: 'Admin',
      lastName: 'User',
      accounts: {
        create: {
          accountId: 'admin-account',
          providerId: 'credential',
          password: adminPassword,
        },
      },
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Test 사용자 생성
  const userPassword = await bcrypt.hash('user123!@#', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@nestjs-boilerplate.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@nestjs-boilerplate.com',
      isEmailVerified: true,
      role: Role.User,
      firstName: 'Test',
      lastName: 'User',
      accounts: {
        create: {
          accountId: 'user-account',
          providerId: 'credential',
          password: userPassword,
        },
      },
    },
  });
  console.log('✅ Created test user:', user.email);

  console.log('🎉 Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

