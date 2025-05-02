import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const sourceDb = new Pool({
  connectionString: process.env.SOURCE_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const updateDb = new Pool({
  connectionString: isProduction
    ? process.env.PROD_UPDATE_DATABASE_URL
    : process.env.DEV_UPDATE_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
