import { ObjectId } from "mongodb";
import connectDB from "@/libs/mongodb";
import TestAttempt from "@/models/testAttempts.model";

export async function POST(req) {
    try {
        // Parse the request body
        const { AttemptId, testPack, testNumber, domain } = await req.json();

        // Validate required fields
        if (!AttemptId || !testPack || !testNumber || !domain) {
            return new Response(
                JSON.stringify({ error: "All fields (AttemptId, testPack, testNumber, domain) are required." }),
                { status: 400 }
            );
        }

        // Establish a database connection
        const dbconn = await connectDB();

        if (!dbconn) {
            return new Response(
                JSON.stringify({ error: "Database connection failed." }),
                { status: 500 }
            );
        }

        // Query the database for the specific attempt
        const attempt = await TestAttempt.findOne({
            _id: new ObjectId(AttemptId), // Convert AttemptId to ObjectId
            packId: testPack,            // Use correct field names from the object
            testId: testNumber,
            domainId: domain,
        });

        // Handle case where no attempt is found
        if (!attempt) {
            return new Response(
                JSON.stringify({ error: "Test attempt not found." }),
                { status: 404 }
            );
        }

        // Return the fetched attempt
        return new Response(JSON.stringify(attempt), { status: 200 });
    } catch (error) {
        console.error("Error fetching unique test attempt:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch test attempt." }),
            { status: 500 }
        );
    }
}
