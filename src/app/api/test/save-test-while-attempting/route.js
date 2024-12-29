import TestAttempt from '@/models/testAttempts.model'; // Import the TestAttempt model
import connectDB from "@/libs/mongodb";

export async function POST(req) {
    try {
        // Connect to the database
        const dbconn = await connectDB();
        if (!dbconn) {
            return new Response(
                JSON.stringify({ error: "Unable to connect to database" }),
                { status: 500 }
            );
        }

        // Parse the incoming request payload
        const { userId, registeredTestId, domainId, packId, testId, responses } = await req.json();

        // Validate input fields
        if (!userId || !registeredTestId || !domainId || !packId || !testId || !responses) {
            return new Response(
                JSON.stringify({ error: "All required fields must be provided." }),
                { status: 400 }
            );
        }

        // Find the test attempt in the database
        const existingAttempt = await TestAttempt.findOne({
            userId,
            registeredTestId,
            domainId,
            packId,
            testId,
        });

        if (!existingAttempt) {
            // If the test attempt does not exist
            return new Response(
                JSON.stringify({ error: "Test attempt not found." }),
                { status: 404 }
            );
        }

        // Update the test attempt with the current responses
        existingAttempt.responses = responses;
        await existingAttempt.save();

        // Return a success message
        return new Response(
            JSON.stringify({ message: "Test attempt successfully updated." }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error saving test attempt:", error);
        return new Response(
            JSON.stringify({ error: "Failed to save test attempt." }),
            { status: 500 }
        );
    }
}
