import { PrismaClient } from '../generated/prisma/edge'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg-cloudflare'

const connectionString = process.env.DATABASE_URL

const pool = new (pg as any).Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
