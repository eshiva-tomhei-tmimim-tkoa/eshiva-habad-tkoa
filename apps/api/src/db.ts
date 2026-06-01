import { PrismaClient } from '@prisma/client';

// Singleton Prisma-клиента (один пул соединений на процесс).
export const prisma = new PrismaClient();
