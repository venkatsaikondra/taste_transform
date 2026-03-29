import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

interface TokenRequest extends Request {
  cookies?: {
    get?: (name: string) => { value: string } | undefined;
  };
}

export async function GET(req: TokenRequest) {
  try {
    await connect();
    const token = req.cookies?.get?.('token')?.value ?? null;
    if (!token) return NextResponse.json({ user: null });

    const payload = verifyToken(token);
    const user = payload?.id ? await User.findById(payload.id).select('-password') : null;
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('me route error', message);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
