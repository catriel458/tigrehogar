import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { products } from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method === 'GET') {
      const allProducts = await db.select().from(products);
      return res.status(200).json(allProducts);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}