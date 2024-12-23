import connectDB from "@/libs/mongodb";
import { NextResponse } from "next/server";
import Question from "@/models/questions.model"; // Import the Question model

export async function POST(req) {
    try {

        const body = await req.json(); // Parse JSON from the request body

        // Connect to the database
        let dbconn = await connectDB();

        const {
            questionId,
            domainId,
            packId,
            testId,
            section,
            type,
            questionText,
            diagramLink,
            options,
            correctAnswers,
            marks,
            negativeMarks,
            difficulty,
            uploadedBy,
        } = body;

        console.log(uploadedBy);

        // Validation for required fields
        if (!questionId || !domainId || !packId || !testId || !questionText) {
            return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
        }

        if (type !== "NUMERICAL" && (!options || options.length < 2)) {
            return NextResponse.json({ error: "MCQ questions must have at least two options." }, { status: 400 });
        }

        if (dbconn) {
            // Create a new question document
            const newQuestion = new Question({
                questionId,
                domainId,
                packId,
                testId,
                section,
                type,
                questionText,
                diagramLink,
                options,
                correctAnswers,
                marks,
                negativeMarks,
                difficulty,
                uploadedBy,
            });

            // Save the question to the database
            await newQuestion.save();

            // Return success response
            return NextResponse.json({ message: "Question added successfully!" }, { status: 200 });
        }
        else {
            return NextResponse.json(
                { msg: "Not able to connect to database" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error adding question:", error);
        // Return failure response
        return NextResponse.json({ error: "Failed to add question. Please try again." }, { status: 500 });
    }
}
