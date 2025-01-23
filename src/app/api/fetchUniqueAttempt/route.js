import { ObjectId } from "mongodb";
import connectDB from "@/libs/mongodb";
import TestAttempt from "@/models/testAttempts.model";
import Questions from "@/models/questions.model"; // Assuming you have a Questions model

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

        // Fetch the test attempt
        const attempt = await TestAttempt.findOne({
            _id: new ObjectId(AttemptId),
            packId: testPack,
            testId: testNumber,
            domainId: domain,
        });

        if (!attempt) {
            return new Response(
                JSON.stringify({ error: "Test attempt not found." }),
                { status: 404 }
            );
        }

        // Fetch all questions in the test
        const questions = await Questions.find({
            packId: testPack,
            testId: testNumber,
            domainId: domain,
        }).lean();

        if (!questions || questions.length === 0) {
            return new Response(
                JSON.stringify({ error: "Questions not found for the specified test." }),
                { status: 404 }
            );
        }

        // Evaluate the responses
        let totalMarks = 0;
        let totalNegativeMarks = 0;
        const evaluationResults = [];

        for (const question of questions) {
            const { _id, type, correctAnswers, marks, negativeMarks } = question;

            // Ensure `_id` is converted to a string for matching
            const questionId = _id.toString();

            // Safely retrieve `userResponse` from `responses` using the stringified `_id`
            const userResponse = attempt.responses?.[questionId] ?? null;

            let questionResult = {
                questionId,
                userResponse,
                marksAwarded: 0,
                status: "not attempted", // Default status is "not attempted"
            };

            if (type === "MCQ_SINGLE") {
                if (userResponse !== null) {
                    if (correctAnswers.includes(userResponse)) {
                        questionResult.marksAwarded = marks;
                        questionResult.status = "correct";
                        totalMarks += marks;
                    } else {
                        questionResult.marksAwarded = -negativeMarks;
                        questionResult.status = "incorrect";
                        totalNegativeMarks += negativeMarks;
                    }
                }
            } else if (type === "MCQ_MULTIPLE") {
                if (userResponse && Array.isArray(userResponse)) {
                    const isCorrect = userResponse.sort().toString() === correctAnswers.sort().toString();
                    if (isCorrect) {
                        questionResult.marksAwarded = marks;
                        questionResult.status = "correct";
                        totalMarks += marks;
                    } else {
                        questionResult.marksAwarded = -negativeMarks;
                        questionResult.status = "incorrect";
                        totalNegativeMarks += negativeMarks;
                    }
                }
            } else if (type === "NUMERICAL") {
                if (userResponse !== null) {
                    if (correctAnswers.includes(userResponse)) {
                        questionResult.marksAwarded = marks;
                        questionResult.status = "correct";
                        totalMarks += marks;
                    } else {
                        questionResult.marksAwarded = -negativeMarks;
                        questionResult.status = "incorrect";
                        totalNegativeMarks += negativeMarks;
                    }
                }
            }

            // Add the result for this question
            evaluationResults.push(questionResult);
        }


        // Calculate final results
        const totalScore = totalMarks - totalNegativeMarks;

        // Save the evaluation results back to the database
        await TestAttempt.updateOne(
            { _id: new ObjectId(AttemptId) },
            {
                $set: {
                    evaluationResults,
                    totalScore,
                    totalMarks,
                    totalNegativeMarks,
                },
            }
        );

        console.log({
            attemptId: AttemptId,
            evaluationResults,
            totalScore,
            totalMarks,
            totalNegativeMarks,
        });

        // Return the evaluated results
        return new Response(
            JSON.stringify({
                attemptId: AttemptId,
                evaluationResults,
                totalScore,
                totalMarks,
                totalNegativeMarks,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error evaluating test attempt:", error);
        return new Response(
            JSON.stringify({ error: "Failed to evaluate test attempt." }),
            { status: 500 }
        );
    }
}
