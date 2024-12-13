import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user.models";


export async function POST(req) {
    let { uid, name, mobile, branch, college } = await req.json();

    let dbconn = await connectDB();
    if (dbconn) {
        let cUser = await User.findOneAndUpdate({ userId: uid }, { name: name, mobile: mobile, college: college, branch: branch });
        if (cUser) {
            return NextResponse.json({ msg: "user updated" }, { status: 200 });
        } else if(!cUser) {
            return NextResponse.json({ msg: "User NOT found" }, { status: 201 });
        }
    } else {
        return NextResponse.json(
            { msg: "Not able to connect to database" },
            { status: 500 }
        );
    }
}