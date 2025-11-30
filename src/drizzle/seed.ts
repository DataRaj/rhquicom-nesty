/* eslint-disable no-console */
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Admin
  const adminEmail = 'admin@nestjs-boilerplate.com';
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash('admin123!@#', 10);
    const [admin] = await db
      .insert(schema.users)
      .values({
        username: 'admin',
        email: adminEmail,
        isEmailVerified: true,
        role: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
      })
      .returning();

    await db.insert(schema.accounts).values({
      userId: admin.id,
      accountId: 'admin-account',
      providerId: 'credential',
      password: adminPassword,
    });
    console.log('✅ Created admin user:', admin.email);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // User
  const userEmail = 'user@nestjs-boilerplate.com';
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, userEmail),
  });

  if (!existingUser) {
    const userPassword = await bcrypt.hash('user123!@#', 10);
    const [user] = await db
      .insert(schema.users)
      .values({
        username: 'testuser',
        email: userEmail,
        isEmailVerified: true,
        role: 'User',
        firstName: 'Test',
        lastName: 'User',
      })
      .returning();

    await db.insert(schema.accounts).values({
      userId: user.id,
      accountId: 'user-account',
      providerId: 'credential',
      password: userPassword,
    });
    console.log('✅ Created test user:', user.email);
  } else {
    console.log('ℹ️ Test user already exists');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await pool.end();
    process.exit(1);
  });
