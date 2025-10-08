import { Express, Request } from "express";
import { storage } from "./storage";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Verificar que la API key está configurada
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY no está configurada');
} else {
  console.log('✅ Resend está configurado correctamente');
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log('Attempting to send email to:', email);
    console.log('Using Resend with from:', process.env.EMAIL_USER);
    
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Tigre Hogar <onboarding@resend.dev>', // Temporal, luego usarás tu dominio
      to: email,
      subject: "Verifica tu email - Tigre Hogar",
      html: `
        <h1>¡Bienvenido a Tigre Hogar!</h1>
        <p>Por favor haz clic en el siguiente enlace para verificar tu dirección de email:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verificar Email</a>
        <p>O copia este enlace en tu navegador:</p>
        <p>${verificationUrl}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email sent successfully:', data?.id);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
}

async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Tigre Hogar <onboarding@resend.dev>',
      to: email,
      subject: "Restablecer contraseña - Tigre Hogar",
      html: `
        <h1>Solicitud de restablecimiento de contraseña</h1>
        <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>O copia este enlace en tu navegador:</p>
        <p>${resetUrl}</p>
        <p><strong>Este enlace expirará en 1 hora.</strong></p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Password reset email sent successfully:', data?.id);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}

export function setupAuth(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Register request body:", req.body);

      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation error:", result.error);
        return res.status(400).json({ error: "Invalid user data" });
      }

      const { username, email, password } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });

      if (user.verificationToken) {
        await sendVerificationEmail(email, user.verificationToken);
      }

      const responseData = {
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          isAdmin: user.isAdmin
        }
      };

      console.log("Sending response:", responseData);
      res.status(201).json(responseData);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      if (!user.emailVerified) {
        return res.status(401).json({ error: "Por favor, verifica tu email antes de iniciar sesión" });
      }

      const validPassword = await comparePasswords(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
      }

      const isAdmin = user.username === 'admin1234' || user.isAdmin;

      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          throw err;
        }
        req.session.userId = user.id.toString();
        req.session.isAdmin = isAdmin ?? false;
      });

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            reject(err);
          }
          resolve();
        });
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        isAdmin: isAdmin
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error al iniciar sesión. Por favor, intenta de nuevo." });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Invalid token" });
      }

      const verified = await storage.verifyEmail(token);
      if (!verified) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const token = await storage.setResetToken(email);
      if (!token) {
        return res.status(404).json({ error: "User not found" });
      }

      await sendPasswordResetEmail(email, token);
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to send reset email" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      const hashedPassword = await hashPassword(password);
      const success = await storage.resetPassword(token, hashedPassword);

      if (!success) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  app.post("/api/users/change-password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      
      const userId = parseInt(req.session.userId);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const validPassword = await comparePasswords(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "La contraseña actual es incorrecta" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Error al cambiar la contraseña" });
    }
  });

  app.use("/api/protected", (req, res, next) => {
    if (!req.session.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  });

  app.get("/api/me", async (req, res) => {
    if (!req.session.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = parseInt(req.session.id);
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });
}