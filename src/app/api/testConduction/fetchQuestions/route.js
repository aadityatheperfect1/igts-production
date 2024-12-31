import connectDB from "@/libs/mongodb";
import Question from "@/models/questions.model";

export async function POST(req) {
    try {
        const { payload } = await req.json();

        const { RegisteredTestId, testPack, testNumber, domain } = payload;

        console.log(RegisteredTestId, testPack, testNumber, domain);

        if (!RegisteredTestId || !testPack || !testNumber || !domain) {
            return new Response(
                JSON.stringify({ error: "All parameters are required." }),
                { status: 400 }
            );
        }

        // Connect to the database
        const dbconn = await connectDB();
        if (!dbconn) {
            return new Response(
                JSON.stringify({ error: "Database connection failed." }),
                { status: 500 }
            );
        }

        // Fetch questions from the database based on the parameters
        const questions = await Question.find({
            domainId: domain,
            packId: testPack,
            testId: testNumber,
        }).lean();

        if (!questions || questions.length === 0) {
            return new Response(
                JSON.stringify({ error: "No questions found for the given parameters." }),
                { status: 404 }
            );
        }

        // Remove the 'correctAnswers' field and arrange questions
        const formattedQuestions = questions
            .map((question) => {
                const { correctAnswers, ...rest } = question;
                return rest;
            })
            .sort((a, b) => {
                // Arrange questions with aptitude first, then subject questions
                if (a.section === "aptitude" && b.section !== "aptitude") return -1;
                if (a.section !== "aptitude" && b.section === "aptitude") return 1;
                return 0;
            });

        return new Response(
            JSON.stringify({ questions: formattedQuestions }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching questions:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch questions." }),
            { status: 500 }
        );
    }
}
