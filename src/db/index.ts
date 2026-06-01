import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set.\n' +
    'Add it to .env.local — see .env.example for the format.\n' +
    'Get the connection string from: Supabase → Settings → Database → Connection string'
  );
}

// `prepare: false` is required for Supabase's PgBouncer / transaction pooler.
// It's a no-op on direct connections, so this config works for both.
const client = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
