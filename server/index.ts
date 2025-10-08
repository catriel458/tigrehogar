import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import session from "express-session";
import createMemoryStore from "memorystore";

const app = express();

// Configuración de sesión
const MemoryStore = createMemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}));

// Middleware para parsear JSON - debe estar antes de las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  // Capturar el body de la request para logging
  if (path.startsWith("/api")) {
    console.log(`${req.method} ${path} Request Body:`, req.body);
  }

  // Interceptar la respuesta para logging
  const originalJson = res.json;
  res.json = function(body) {
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} Response Body:`, body);
    }
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      console.log(logLine);
    }
  });

  next();
});

// Configurar autenticación
setupAuth(app);

// Configurar rutas
const server = registerRoutes(app);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Start server
const PORT = parseInt(process.env.PORT || "5000");
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});