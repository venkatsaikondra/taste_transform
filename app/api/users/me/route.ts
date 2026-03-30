import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function GET(req: NextRequest) {
  try {
    await connect();
    const token = req.cookies.get('token')?.value ?? null;
    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token);
    if (!payload?.id) return NextResponse.json({ user: null });
    const user = await User.findById(payload.id).select('-password');
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error('me route error', err instanceof Error ? err.message : err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
