import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/userModel';

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

export async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || '';
    
    if (!token) {
      return null;
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken || !decodedToken.id) {
      return null;
    }

    const user = await User.findById(decodedToken.id).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

const auth = { signToken, verifyToken, getUserFromToken };
export default auth;