// ─────────────────────────────────────────────────────────────
// Database Connection (Prisma Client Singleton)
// ─────────────────────────────────────────────────────────────
//
// WHY A SINGLETON?
// In development, Next.js uses "hot reloading" — every time you
// save a file, it re-runs your code. Without this pattern, each
// reload would create a NEW database connection, eventually
// exhausting the connection limit and crashing your app.
//
// This pattern stores the Prisma client on the global object,
// so it survives hot reloads and gets reused.
//
// 📚 PRISMA 7 LEARNING POINT:
// In Prisma 7, you use a "driver adapter" to connect to the database.
// Instead of Prisma managing the connection internally, YOU provide
// the database driver. This gives you more control and lets Prisma
// work with edge runtimes and serverless environments.
//
// We use `@prisma/adapter-pg` with the `pg` package to connect
// to our Neon PostgreSQL database.
// ─────────────────────────────────────────────────────────────

import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Step 1: Declare a global variable to hold the Prisma client.
// This uses TypeScript's `globalThis` so the variable persists
// across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Step 2: Create a function that builds the Prisma client
// with the PostgreSQL adapter.
function createPrismaClient(): PrismaClient {
  // Create a pg Pool. Neon requires ssl: true for connections.
  const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Provide SSL to ensure Neon accepts the connection
      ssl: {
          rejectUnauthorized: false
      }
  });
  
  // Create the PostgreSQL adapter.
  const adapter = new PrismaPg(pool);

  // Create the Prisma client with the adapter
  return new PrismaClient({ adapter });
}

// Step 3: Either reuse the existing client or create a new one.
// The `??` operator means: "use the left side if it exists,
// otherwise use the right side."
const db = globalForPrisma.prisma ?? createPrismaClient();

// Step 4: In development, save the client to the global object
// so it can be reused on the next hot reload.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Step 5: Export the database client so other files can use it.
// Usage: import { db } from "@/lib/db";
//        const users = await db.user.findMany();
export { db };
