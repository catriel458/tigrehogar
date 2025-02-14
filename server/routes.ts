import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
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
    const user = await storage.getUserById(req.session.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Solo los administradores pueden editar productos" });
    }

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
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Solo los administradores pueden eliminar productos" });
    }

    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(204).send();
  });

  return createServer(app);
}