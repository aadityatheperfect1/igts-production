import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import FAQ from "@/models/faq.model"; // Assuming faq.models.js contains the FAQ schema

export async function GET() {
    let dbconn = await connectDB();
    if (dbconn) {
        try {
            const faqs = await FAQ.find({});
            return NextResponse.json(faqs, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { msg: "Error fetching FAQs", error: error.message },
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
