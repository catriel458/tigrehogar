import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import session from "express-session";
import createMemoryStore from "memorystore";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de sesión
const MemoryStore = createMemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000
  })
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  if (path.startsWith("/api")) {
    console.log(`${req.method} ${path} Request Body:`, req.body);
  }

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
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Configurar autenticación
setupAuth(app);

// Configurar rutas API
const server = registerRoutes(app);

// Determinar la ruta correcta para archivos estáticos
// En producción (Render): /opt/render/project/src/dist/public
// En desarrollo: ./dist/public
let publicPath;

if (process.env.RENDER) {
  // En Render, el código está en /opt/render/project/src/
  publicPath = '/opt/render/project/src/dist/public';
} else {
  // En local, relativo a donde está el archivo compilado
  publicPath = path.join(__dirname, 'public');
}

console.log('=== Server Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);
console.log('Public path:', publicPath);
console.log('Public path exists:', existsSync(publicPath));

if (existsSync(publicPath)) {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('index.html exists:', existsSync(indexPath));
}

app.use(express.static(publicPath));

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(publicPath, 'index.html');
    
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        error: 'Frontend build not found',
        publicPath,
        indexPath,
        __dirname,
        cwd: process.cwd()
      });
    }
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

const PORT = parseInt(process.env.PORT || "5000");
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});