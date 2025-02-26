import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey().notNull(), // // no es necesario usar `autoIncrement()` ni `primaryKey()` explícitamente
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: integer("reset_password_expires"),
  createdAt: integer("created_at").default(Date.now()),
});

export const insertProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.number().positive("El precio debe ser positivo").min(1, "El precio debe ser mayor a 0"),
  image: z.string().url("Debe ser una URL válida"),
  category: z.string().min(2, "La categoría debe tener al menos 2 caracteres"),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
  });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;