import { products, users, type Product, type InsertProduct, type User, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Configurar conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyEmail(token: string): Promise<boolean>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<boolean>;
  setResetToken(email: string): Promise<string | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return result[0];
  }

  async updateProduct(id: number, updateProduct: InsertProduct): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set(updateProduct)
      .where(eq(products.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return result.length > 0;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const verificationToken = randomBytes(32).toString('hex');
    const result = await db
      .insert(users)
      .values({
        ...insertUser,
        verificationToken,
        emailVerified: false,
      })
      .returning();
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(users.verificationToken, token))
      .returning();
    return result.length > 0;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  async setResetToken(email: string): Promise<string | undefined> {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; 

    const result = await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .where(eq(users.email, email))
      .returning();

    return result.length > 0 ? token : undefined;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.resetPasswordToken, token))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();