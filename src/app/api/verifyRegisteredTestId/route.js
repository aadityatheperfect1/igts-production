import connectDB from "@/libs/mongodb";
import TestRegistration from "@/models/testRegistrations.models";

export async function POST(req) {
    try {
        const { RegisteredTestId } = await req.json();

        if (!RegisteredTestId) {
            return new Response(
                JSON.stringify({ error: "Registered Test ID is required." }),
                { status: 400 }
            );
        }

        const dbconn = await connectDB();

        if (!dbconn) {
            return new Response(
                JSON.stringify({ error: "Database connection failed." }),
                { status: 500 }
            );
        }

        const test = await TestRegistration.findOne({ _id: RegisteredTestId });

        if (!test) {
            return new Response(
                JSON.stringify({ error: "Registered Test not found." }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify({ valid: true, test }), { status: 200 });
    } catch (error) {
        console.error("Error verifying Registered Test ID:", error);
        return new Response(
            JSON.stringify({ error: "Failed to verify Registered Test ID." }),
            { status: 500 }
        );
    }
}
