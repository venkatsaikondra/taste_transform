import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function GET(req: Request) {
  try {
    await connect();
    const token = (req as any).cookies?.get?.('token')?.value ?? null;
    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('me route error', err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
