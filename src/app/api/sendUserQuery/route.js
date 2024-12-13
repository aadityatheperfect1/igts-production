// /app/api/contact/route.js

import { NextResponse } from "next/server";
import { sendMail } from "@/libs/mail";

export async function POST(request) {
    try {
        // Parse the JSON body from the request
        const { name, email, message } = await request.json();

        // Check for required fields
        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Set up the email details
        const to = "dhanak2k25@gmail.com";
        const subject = `Query from ${name}`;
        const body = `Email: ${email}<br>Message: ${message}`;

        // Send the email
        await sendMail({ to, name, subject, body });

        // Respond with success message
        return NextResponse.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}



