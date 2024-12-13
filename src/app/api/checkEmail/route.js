import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user.models";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Connect to the database
    const dbconn = await connectDB();
    if (!dbconn) {
      return NextResponse.json(
        { msg: "Failed to connect to the database" },
        { status: 500 }
      );
    }

    // Check if the user exists
    const user = await User.findOne({ email: email }).maxTimeMS(5000);
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 201 });
    }

    return NextResponse.json({ msg: "User found" }, { status: 200 });
  } catch (error) {
    console.error("Error in checkEmail function:", error.message);
    return NextResponse.json(
      { msg: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
