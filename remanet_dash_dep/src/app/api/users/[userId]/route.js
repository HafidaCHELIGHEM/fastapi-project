import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { userId } = await params;
    const { name, email, password, role } = await req.json();

    // Connect to database
    await connectMongoDB();

    // Find user by ID
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (email !== existingUser.email) {
      const emailInUse = await User.findOne({ email });
      if (emailInUse) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update object
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      role: role || existingUser.role,
    };

    // Only hash and update password if it's provided
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password"); // Exclude password from response

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};

      // Extract specific field errors
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 422 }
      );
    }
  }
  return NextResponse.json({ message: "Error updating user" }, { status: 500 });
}

// // Optional: GET endpoint to fetch single user
// export async function GET(req, { params }) {
//   try {
//     const { userId } = params;
//     await connect();

//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return NextResponse.json(
//       { message: "Error fetching user" },
//       { status: 500 }
//     );
//   }
// }
