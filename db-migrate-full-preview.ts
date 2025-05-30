import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Adding full_preview_url column to videos table...');
  
  try {
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS full_preview_url TEXT;`;
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding the column:', error);
  }

  console.log('Migration completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});