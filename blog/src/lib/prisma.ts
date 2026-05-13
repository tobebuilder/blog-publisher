import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 强制设置引擎类型（虽然环境变量更稳，但代码里也加上兜底）
// @ts-ignore
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  globalThis.PRISMA_CLIENT_ENGINE_TYPE = 'wasm'
}

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  })()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
