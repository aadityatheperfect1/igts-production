import connectDB from "@/libs/mongodb";
import Question from "@/models/questions.model";

export async function POST(req) {
    try {
        const { questionId, questionText, options } = await req.json();

        // Validate request payload
        if (!questionId || !questionText || !Array.isArray(options) || options.length === 0) {
            return new Response(
                JSON.stringify({
                    error: "Question ID, question text, and valid options are required.",
                }),
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

        // Update the question document
        const updatedQuestion = await Question.findOneAndUpdate(
            { questionId },
            { $set: { questionText, options } },
            { new: true } // Return the updated document
        );

        if (!updatedQuestion) {
            return new Response(
                JSON.stringify({ error: "Question not found." }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Question updated successfully.",
                updatedQuestion,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating question:", error);
        return new Response(
            JSON.stringify({ error: "Failed to update question." }),
            { status: 500 }
        );
    }
}
