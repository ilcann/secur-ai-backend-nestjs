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

  await prisma.aiProvider.upsert({
    where: { name: 'OPENAI' },
    update: {},
    create: {
      name: 'OPENAI',
      apiKey: 'sk-...',
    },
  });

  await prisma.aiModel.upsert({
    where: { name: 'gpt-3.5-turbo' },
    update: {},
    create: {
      name: 'gpt-3.5-turbo',
      description: 'A variant of GPT-3 optimized for chat',
      providerId: 1,
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
