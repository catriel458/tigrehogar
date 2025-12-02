import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Borrar la cookie del token
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  
  return res.status(200).json({ message: 'Logged out successfully' });
}