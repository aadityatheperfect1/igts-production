import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user.models";

export async function POST(req) {
  let { email } = await req.json();
  let dbconn = await connectDB();
  if (dbconn) {
    let doc = await User.findOne({ email: email });
    if (!doc) {
      return NextResponse.json({ msg: "User not found" }, { status: 201 });
    } else {
      return NextResponse.json({ msg: "User found" }, { status: 200 });
    }
  } else {
    return NextResponse.json(
      { msg: "Not able to connect to database" },
      { status: 500 }
    );
  }
}
