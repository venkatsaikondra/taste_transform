/*import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { email, password } = await request.json();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Validate password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Create token data and sign
    const tokenData = { id: user._id, username: user.username, email: user.email };
    const token = signToken(tokenData);

    const response = NextResponse.json({ message: "Login successful", success: true });
    // Set a secure, httpOnly cookie. Use SameSite=Lax to allow top-level navigation.
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}*/

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { signToken } from '@/lib/auth';
export async function POST(request: NextRequest) {
  try {
    await connect();
    const { email, password } = await request.json();
    
    // Normalize email to lowercase to match signup logic
    const lowEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowEmail });
    if (!user) {
      // Returns specific message for frontend toast
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      // Returns specific message for frontend toast
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const tokenData = { id: user._id, username: user.username, email: user.email };
    const token = signToken(tokenData);

    const response = NextResponse.json({ 
      message: "Login successful", 
      success: true,
      user: { username: user.username } 
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      // Fixed for mobile: only strict secure in true production
      //secure: process.env.NODE_ENV === 'production' && !request.url.includes('localhost'),
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}