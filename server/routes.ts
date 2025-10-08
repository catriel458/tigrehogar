import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Ruta de health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Solo los administradores pueden agregar productos" });
    }
    
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos de producto inválidos" });
    }
    
    try {
      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertProductSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: "Datos de producto inválidos" });
    }
    
    try {
      const product = await storage.updateProduct(id, result.data);
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  return createServer(app);
}