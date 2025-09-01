import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👑 Logic: make a specific email the OWNER
    let role = "USER";
    if (email === "tempmaillinux@gmail.com") {
      role = "OWNER";
    }

    // Create user in Supabase via Prisma
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
