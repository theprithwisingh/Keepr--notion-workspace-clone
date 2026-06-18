// ─────────────────────────────────────────────────────────────
// Prisma Config — Prisma 7 Configuration File
// ─────────────────────────────────────────────────────────────
//
// 📚 PRISMA 7 LEARNING POINT:
// In Prisma 7, the database connection URL moved from
// schema.prisma to this config file. This gives you more
// flexibility (e.g., different URLs for development vs production).
//
// The `defineConfig` function provides TypeScript autocomplete
// and validation for all configuration options.
// ─────────────────────────────────────────────────────────────

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to your Prisma schema file
  schema: "prisma/schema.prisma",

  // Database connection URL — reads from your .env file
  // For PostgreSQL (Neon): "postgresql://user:pass@host/dbname?sslmode=require"
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
