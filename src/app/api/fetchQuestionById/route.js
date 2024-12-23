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

        const question = await Question.findOne({ questionId });

        if (!question) {
            return new Response(
                JSON.stringify({ error: "Question not found." }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify(question), { status: 200 });
    } catch (error) {
        console.error("Error fetching question:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch question." }),
            { status: 500 }
        );
    }
}
