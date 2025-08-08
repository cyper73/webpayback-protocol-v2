import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration
const databaseUrl = process.env.DATABASE_URL;

let db: any;
let pool: any;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL environment variable is not set');
  console.log('🔧 Using mock database for development...');
  
  // Mock database implementation for development
  db = {
    query: {
      agents: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
        create: () => Promise.resolve(null),
        update: () => Promise.resolve(null),
        delete: () => Promise.resolve(null)
      },
      tasks: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
        create: () => Promise.resolve(null),
        update: () => Promise.resolve(null),
        delete: () => Promise.resolve(null)
      }
    },
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([])
      })
    }),
    insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([])
        })
      }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(null)
      })
    }),
    delete: () => ({
      from: () => ({
        where: () => Promise.resolve(null)
      })
    })
  };
  
  pool = null;
} else {
  console.log('🔧 Connecting to PostgreSQL database...');
  
  // Create PostgreSQL connection
  pool = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  // Create Drizzle instance with schema
  db = drizzle(pool, { schema });
  
  console.log('✅ Database connection established');
}

export { db, pool };