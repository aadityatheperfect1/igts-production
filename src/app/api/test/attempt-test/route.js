import TestAttempt from '@/models/testAttempts.model'; // Import the TestAttempt model
import connectDB from "@/libs/mongodb";


export async function POST(req) {
    try {
        // Connect to the database
        let dbconn = await connectDB();

        if (!dbconn) {
            return NextResponse.json(
                { msg: "Not able to connect to database" },
                { status: 500 }
            );
        }

        // Parse the incoming request payload
        const {
            userId,
            registeredTestId,
            domainId,
            packId,
            testId,
        } = await req.json();

        // Check if all required fields are present
        if (!userId || !registeredTestId || !domainId || !packId || !testId) {
            return new Response(
                JSON.stringify({ error: 'All required fields must be provided.' }),
                { status: 400 }
            );
        }

        // Check if a test attempt for the same user and test already exists
        const existingAttempt = await TestAttempt.findOne({
            userId,
            registeredTestId,
            domainId,
            packId,
            testId,
        });

        if (existingAttempt) {
            // If an attempt already exists, return its details
            return new Response(
                JSON.stringify({
                    message: 'Test attempt already exists.',
                    attempt: existingAttempt,
                }),
                { status: 200 }
            );
        }

        // If no existing attempt, create a new test attempt
        const startTimeDate = new Date();
        const endTimeDate = new Date(startTimeDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours in milliseconds

        const newAttempt = await TestAttempt.create({
            userId,
            registeredTestId,
            domainId,
            packId,
            testId,
            startTime: startTimeDate,
            endTime: endTimeDate,
        });

        // Return the new test attempt details
        return new Response(
            JSON.stringify({
                message: 'New test attempt created.',
                attempt: newAttempt,
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error processing test attempt:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process test attempt.' }),
            { status: 500 }
        );
    }
}
