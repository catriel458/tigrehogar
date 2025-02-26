// session.d.ts
import { Session } from 'express-session';

declare module 'express-session' {
  interface Session {
    isAdmin?: boolean; // Añades isAdmin como propiedad opcional
  }
}
