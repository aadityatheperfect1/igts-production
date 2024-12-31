import connectDB from "@/libs/mongodb";
import TestAttempt from "@/models/testAttempts.model";

export async function POST(req) {
    try {
        // Parse the incoming request body
        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "User ID is required." }),
                { status: 400 }
            );
        }

        // Establish the database connection
        const dbconn = await connectDB();

        if (!dbconn) {
            return new Response(
                JSON.stringify({ error: "Database connection failed." }),
                { status: 500 }
            );
        }

        // Fetch all test attempts for the given user
        const testAttempts = await TestAttempt.find({ userId });

        if (!testAttempts || testAttempts.length === 0) {
            return new Response(
                JSON.stringify({ error: "No attempts found for this user." }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify(testAttempts), { status: 200 });
    } catch (error) {
        console.error("Error fetching test attempts:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch test attempts." }),
            { status: 500 }
        );
    }
}
