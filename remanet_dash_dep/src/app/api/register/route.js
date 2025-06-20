import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// export async function POST(req) {
//   try {
//     const { name, email, password, role } = await req.json();
//     console.log("hhh", { name, email, role });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await connectMongoDB();

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     console.log("User created successfully in database:", user.email);

//     return NextResponse.json({ message: "User registered." }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "An error occurred while registering the user." },
//       { status: 500 }
//     );
//   }
// }


// api/register/route.js
export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();
    await connectMongoDB();

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      // Extract specific field errors
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return NextResponse.json(
        { 
          message: "Validation failed",
          errors: validationErrors
        },
        { status: 422 }
      );
    }
    
    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          message: "Duplicate field",
          error: `${Object.keys(error.keyPattern)[0]} already exists`
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}