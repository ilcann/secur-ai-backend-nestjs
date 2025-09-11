import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const allDepartment = await prisma.department.upsert({
    where: { name: 'All' },
    update: {},
    create: {
      name: 'All',
      description: 'Default department for system-wide users and bots',
    },
  });

  const randomPassword = crypto.randomBytes(16).toString('base64');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  await prisma.user.upsert({
    where: { email: 'ai-bot@tssx.com' },
    update: {},
    create: {
      email: 'ai-bot@tssx.com',
      firstName: 'AI',
      lastName: 'Assistant',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: allDepartment.id,
      isSystem: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed successfully.');
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
