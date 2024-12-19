
import connectDB from "@/libs/mongodb"; // Ensure you have a DB connection utility
import TestRegistration from '@/models/testRegistrations.models';
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Parse the request body
        const { userId } = await req.json();
        console.log("Received userId:", userId);

        // Validate `userId`
        if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
            return NextResponse.json({ error: "Invalid or missing userId" }, { status: 400 });
        }

        // Connect to the database
        const dbconn = await connectDB();
        if (!dbconn) {
            return NextResponse.json({ error: "DB Connection Error" }, { status: 500 });
        }

        // Fetch registrations for the user
        const registrations = await TestRegistration.find({ userId })
            .populate("userId", "name email") // Populate user details (optional)
            .populate("payment", "status amount"); // Populate payment details (optional)

        // Check if any registrations were found
        if (!registrations || registrations.length === 0) {
            return NextResponse.json({ message: "No registrations found for this user" }, { status: 201 });
        }

        // Return the registrations
        return NextResponse.json({ msg: "Registrations Found", registrations }, { status: 200 });
    } catch (error) {
        console.error("Error in fetching registrations:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
