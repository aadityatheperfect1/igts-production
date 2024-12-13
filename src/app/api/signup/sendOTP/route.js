import connectDB from "@/libs/mongodb";
import User from "@/models/user.models";
import { NextResponse } from "next/server";
import mail, { sendMail } from "@/libs/mail";
import { signupOtp } from '@/components/signupOtp';

async function generateUsername(email) {
    let username = email.split("@")[0];
    let user = await User.findOne({ username: username });
    if (user) {
        let count = 1;
        while (user) {
            username = username + count;
            user = await User.findOne({ username: username });
            count++;
        }
        return username;
    }
    return username;
}


export async function POST(req) {
    const send = async (to, name, subject, body) => {
        "use server"
        await sendMail({ to, name, subject, body });  // Pass as an object
    };

    const { email } = await req.json();
    let dbconn = await connectDB();
    if (dbconn) {
        let doc = await User.findOne({ email });
        if (doc) {
            return NextResponse.json({ msg: "User already exists" }, { status: 201 });
        }

        let username = await generateUsername(email);
        let otp = Math.floor(1000 + Math.random() * 9000);
        console.log("OTP Generated:", otp);

        await send(email, username, "GATE Mock OTP", signupOtp(otp));  // Await the send function

        return NextResponse.json(
            { msg: "OTP sent", username, otp },
            { status: 200 }
        );
    } else {
        return NextResponse.json(
            { msg: "Cannot connect to database." },
            { status: 201 }
        );
    }
}