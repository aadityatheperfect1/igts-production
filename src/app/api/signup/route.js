import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user.models";

export async function POST(req) {
  const { currUser, username, name, mobile, college, branch } = await req.json();
  if (currUser) {
    let dbconn = await connectDB();
    if (dbconn) {
      const nop = await User.countDocuments();
      if (username) {
        const newUser = await User.create({
          username: username,
          name: name,
          mobile: mobile,
          role: "user",
          college: college,
          branch: branch,
          email: currUser.email,
          userId: currUser.uid,
          registeredTests: [],
        });
        const createdUser = await User.findOne({ username: username });
        if (!createdUser) {
          return NextResponse.json(
            { msg: "User not created" },
            { status: 500 }
          );
        } else {
          return NextResponse.json(
            { msg: "User Created", nUser: createdUser },
            { status: 200 }
          );
        }
      } else {
        return NextResponse.json(
          { msg: "User already exists" },
          { status: 201 }
        );
      }
    } else {
      return NextResponse.json(
        { msg: "Not able to connect to database" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ msg: "Error" }, { status: 401 });
  }
}
