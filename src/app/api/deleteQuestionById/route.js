import connectDB from "@/libs/mongodb";
import Question from "@/models/questions.model";

export async function POST(req) {
    try {
        const { questionId } = await req.json();

        if (!questionId) {
            return new Response(
                JSON.stringify({ error: "Question ID is required." }),
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

        // Attempt to delete the question
        const result = await Question.deleteOne({ questionId });

        if (result.deletedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Question not found or already deleted." }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "Question deleted successfully." }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting question:", error);
        return new Response(
            JSON.stringify({ error: "Failed to delete question." }),
            { status: 500 }
        );
    }
}
