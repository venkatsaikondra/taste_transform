import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // 1. Ensure DB Connection is active
    await connect();

    // 2. Parse body
    const reqBody = await request.json();
    const { username, email, password } = reqBody;

    // Basic Validation
    if (!username || !email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 3. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 4. Secure Password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // 5. Save to MongoDB
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      userId: savedUser._id
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}