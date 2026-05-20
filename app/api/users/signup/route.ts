import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
export async function POST(request: NextRequest) {
  try {
    await connect();
    const { username, email, password } = await request.json();

    // 1. Check if Username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    // 2. Check if Email is taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 3. Hash and Save
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      generationCount: 0,
    });
    await newUser.save();

    return NextResponse.json({
      message: "User created successfully",
      success: true,
    }, { status: 201 });

  } catch (error: unknown) {
    // Catch-all for MongoDB unique errors that might slip through
    if (typeof error === 'object' && error !== null && 'code' in error && (error as Record<string, unknown>).code === 11000) {
      return NextResponse.json({ error: "Username or Email already in use" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("Signup Error:", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}