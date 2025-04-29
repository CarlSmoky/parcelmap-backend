import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const sourceDb = new Pool({
  connectionString: process.env.SOURCE_DATABASE_URL
});

export const updateDb = new Pool({
  connectionString: process.env.UPDATE_DATABASE_URL
});
