import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import FAQ from "@/models/faq.model"; // Assuming faq.models.js contains the FAQ schema

export async function POST(req) {
    const { question, answer, category, createdByEmail } = await req.json();

    let dbconn = await connectDB();
    if (dbconn) {
        try {
            // Create a new FAQ entry
            const newFAQ = new FAQ({
                question,
                answer,
                category,
                createdByEmail,
            });

            // Save the new FAQ to the database
            await newFAQ.save();

            return NextResponse.json(
                { msg: "FAQ created successfully", faq: newFAQ },
                { status: 201 }
            );
        } catch (error) {
            return NextResponse.json(
                { msg: "Error creating FAQ", error: error.message },
                { status: 500 }
            );
        }
    } else {
        return NextResponse.json(
            { msg: "Not able to connect to database" },
            { status: 500 }
        );
    }
}
