// custom.d.ts
declare global {
    namespace Express {
      interface Session {
        id: number;  // Ahora se acepta un número en lugar de un string
      }
    }
  }
  