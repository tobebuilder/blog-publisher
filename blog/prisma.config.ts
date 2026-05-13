import dotenv from "dotenv";
// 优先加载 .env.local
dotenv.config({ path: ".env", override: true });
dotenv.config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // migrate/db push 用直连（端口5432），应用运行时 Next.js 会直接读 .env.local 里的 DATABASE_URL
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
