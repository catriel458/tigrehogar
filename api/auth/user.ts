import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { getTokenFromRequest, verifyToken } from '../_utils/jwt';

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: integer("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(200).json(null);
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(200).json(null);
    }

    // Obtener usuario actualizado de la DB
    const result = await db.select().from(users).where(eq(users.id, payload.userId));
    const user = result[0];

    if (!user) {
      return res.status(200).json(null);
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in /api/auth/user:', error);
    return res.status(200).json(null);
  }
}