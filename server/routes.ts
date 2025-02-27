import type { Express, Request, Response } from "express";
import type { SessionData } from "express-session";
import session from "express-session";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
    id: string | null;
  }
}

import express from "express";
const app = express();
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use((req, _res, next) => {
  if (req.session) {
    req.session.isAdmin = req.session.isAdmin || false;
    req.session.id = req.session.id || "";
  }
  next();
});

export function registerRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    // Mantuve esta verificación ya que solo mencionaste editar/borrar
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Solo los administradores pueden agregar productos" });
    }
    
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos de producto inválidos" });
    }
    
    const product = await storage.createProduct(result.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    // Eliminada la verificación de administrador
    const id = parseInt(req.params.id);
    const result = insertProductSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: "Datos de producto inválidos" });
    }
    
    const product = await storage.updateProduct(id, result.data);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    // Eliminada la verificación de administrador
    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    
    if (!success) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.status(204).send();
  });

  return createServer(app);
}