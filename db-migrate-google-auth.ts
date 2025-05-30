import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Migrating database for Google authentication...');

  try {
    // Alter users table to add Google authentication columns
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS google_name TEXT,
      ADD COLUMN IF NOT EXISTS google_email TEXT,
      ADD COLUMN IF NOT EXISTS google_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local',
      ALTER COLUMN password DROP NOT NULL;
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();