import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "./shared/schema";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Run the migration
const main = async () => {
  try {
    // Use manual SQL to create the filters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS filters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Add email column to users table if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'email'
        ) THEN
          ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
          
          -- Update existing users with default emails
          UPDATE users SET email = username || '@platehub.com' WHERE email IS NULL;
          
          -- Make email column not null after populating data
          ALTER TABLE users ALTER COLUMN email SET NOT NULL;
        END IF;
      END $$;
    `);
    
    // Create favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, video_id)
      );
    `);
    
    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();