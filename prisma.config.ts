import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 迁移走直连（session pooler 5432），运行时走 transaction pooler 6543
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
