import jwt from 'jsonwebtoken';

// Use a fallback or casting to ensure TS knows it's a string
const TOKEN_SECRET = process.env.TOKEN_SECRET || '';

// Improved check: If secret is missing during build, it won't crash 
// but will throw descriptive errors during actual execution.
export function signToken(payload: object) {
  if (!TOKEN_SECRET) {
    throw new Error('CRITICAL: TOKEN_SECRET is missing from environment variables.');
  }
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  if (!TOKEN_SECRET) {
    throw new Error('CRITICAL: TOKEN_SECRET is missing from environment variables.');
  }
  try {
    return jwt.verify(token, TOKEN_SECRET) as any;
  } catch (error) {
    return null; // Return null on invalid tokens for easier handling in middleware
  }
}

const auth = { signToken, verifyToken };
export default auth;