import connectDB from "@/libs/mongodb";
import User from "@/models/user.models";
import { NextResponse } from "next/server";
import TestRegistration from "@/models/testRegistrations.models";
import { Payment } from "@/models/payments.models";

export async function POST(req) {
    const { userId } = await req.json();

    // Check if userId is provided
    if (!userId) {
        return NextResponse.json({ msg: "Not Authenticated" }, { status: 401 });
    }

    // Connect to the database
    const dbconn = await connectDB();
    if (!dbconn) {
        return NextResponse.json({ msg: "DB Connection Error" }, { status: 402 });
    }

    // Fetch the user and populate registrations
    try {
        const cUser = await User.findOne({ userId }).populate({
            path: 'registeredTests', // Populate the registeredTests field
            model: 'TestRegistration', // Reference the TestRegistration model
            populate: [
                { path: 'payment', select: 'status amount' }, // Populate payment details if needed
                { path: 'userId', select: 'name email' }, // Populate user details if needed
            ]
        });

        if (!cUser) {
            return NextResponse.json({ msg: "No user found" }, { status: 200 });
        }

        // Send the user data along with the populated registration data
        return NextResponse.json({ msg: "User Found", user: cUser }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ msg: "Error fetching user data", error: error.message }, { status: 500 });
    }
}
