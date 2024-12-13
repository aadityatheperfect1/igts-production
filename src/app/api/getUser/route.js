import connectDB from "@/libs/mongodb";
import User from "@/models/user.models";
import { NextResponse } from "next/server";


export async function POST(req) {
    const { userId } = await req.json();
    console.log(userId);
    if (!userId) {
        return NextResponse.json({ msg: "Not Authenticated" }, { status: 401 });
    }

    const dbconn = await connectDB();
    if (!dbconn) {
        return NextResponse.json({ msg: "DB Connection Error" }, { status: 402 });
    }

    const cUser = await User.findOne({ userId });

    if (!cUser) {
        return NextResponse.json({ msg: "No user found" }, { status: 200 });
    }

    return NextResponse.json({ msg: "User Found", user: cUser }, { status: 200 });
}