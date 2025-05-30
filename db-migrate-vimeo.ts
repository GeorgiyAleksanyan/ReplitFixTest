import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import * as schema from "./shared/schema";
import { sql } from "drizzle-orm";
import ws from "ws";

// Configure NeonDB to use the ws package
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log("Starting migration to add vimeo_embed_url column...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    // Check if the column already exists
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'videos' 
      AND column_name = 'vimeo_embed_url'
    `);

    // Check if no rows were returned
    if ((result as any).rows?.length === 0) {
      // Column doesn't exist, add it
      console.log("Adding vimeo_embed_url column to videos table...");
      await db.execute(sql`
        ALTER TABLE videos
        ADD COLUMN vimeo_embed_url TEXT
      `);
      console.log("vimeo_embed_url column added successfully!");
    } else {
      console.log("vimeo_embed_url column already exists, skipping...");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Database migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database migration failed:", err);
    process.exit(1);
  });