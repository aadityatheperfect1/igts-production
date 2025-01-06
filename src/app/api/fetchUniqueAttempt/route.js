import { ObjectId } from "mongodb";
import connectDB from "@/libs/mongodb";
import FakeTestAttempt from "@/models/faketestAttempts.model";
import TestAttempt from "@/models/testAttempts.model";
import Question from "@/models/questions.model";
import Report from "@/models/reports.model";

const rankRanges = {
  Aerospace: [
    { minScore: 80, maxScore: 100, rankRange: "1-500" },
    { minScore: 70, maxScore: 79, rankRange: "500-1000" },
    { minScore: 60, maxScore: 69, rankRange: "1000-2000" },
    { minScore: 50, maxScore: 59, rankRange: "2000-5000" },
    { minScore: 40, maxScore: 49, rankRange: "5000-10000" },
    { minScore: 30, maxScore: 39, rankRange: "10000-15000" },
    { minScore: 20, maxScore: 29, rankRange: "15000-20000" },
    { minScore: 10, maxScore: 19, rankRange: "20000-30000" },
    { minScore: 0, maxScore: 9, rankRange: "30000+" },
  ],
  Mechanical: [
    { minScore: 85, maxScore: 100, rankRange: "1-500" },
    { minScore: 75, maxScore: 84, rankRange: "500-1000" },
    { minScore: 65, maxScore: 74, rankRange: "1000-2000" },
    { minScore: 55, maxScore: 64, rankRange: "2000-5000" },
    { minScore: 45, maxScore: 54, rankRange: "5000-10000" },
    { minScore: 35, maxScore: 44, rankRange: "10000-15000" },
    { minScore: 25, maxScore: 34, rankRange: "15000-20000" },
    { minScore: 15, maxScore: 24, rankRange: "20000-30000" },
    { minScore: 0, maxScore: 14, rankRange: "30000+" },
  ],
  ECE: [
    { minScore: 90, maxScore: 100, rankRange: "1-500" },
    { minScore: 80, maxScore: 89, rankRange: "500-1000" },
    { minScore: 70, maxScore: 79, rankRange: "1000-2000" },
    { minScore: 60, maxScore: 69, rankRange: "2000-5000" },
    { minScore: 50, maxScore: 59, rankRange: "5000-10000" },
    { minScore: 40, maxScore: 49, rankRange: "10000-15000" },
    { minScore: 30, maxScore: 39, rankRange: "15000-20000" },
    { minScore: 20, maxScore: 29, rankRange: "20000-30000" },
    { minScore: 0, maxScore: 19, rankRange: "30000+" },
  ],
};

class EvaluatedResult {
  constructor(attemptId, responses, questions) {
    // Initialize section-wise objects to prevent undefined errors

    this.attemptId = attemptId;

    this.aptitude = {
      correctedQuestions: [],
      incorrectQuestions: [],
      unattemptedQuestions: [],
      score: {
        positive: 0,
        negative: 0,
        total: 0,
      },
      accuracy: 0,
    };
    this.subject = {
      correctedQuestions: [],
      incorrectQuestions: [],
      unattemptedQuestions: [],
      score: {
        positive: 0,
        negative: 0,
        total: 0,
      },
      accuracy: 0,
    };
    // You can add more sections if needed, based on the sections in your questions

    questions.forEach((question) => {
      const qid = question._id.toString();
      const section = question.section;
      const response = responses[qid];

      // Initialize section if not already present
      if (!this[section]) {
        this[section] = {
          correctedQuestions: [],
          incorrectQuestions: [],
          unattemptedQuestions: [],
        };
      }

      // Process responses
      if (response) {
        // Handle MCQ_MULTIPLE (Multiple choice with multiple correct answers)
        if (question.type === "MCQ_MULTIPLE") {
          // Sort both answers to handle cases where the order of answers doesn't matter
          const isCorrect =
            response.length === question.correctAnswers.length &&
            response.every(
              (val, index) => val === question.correctAnswers[index]
            );

          if (isCorrect) {
            this[section].correctedQuestions.push({
              question: question,
              correctAnswer: question.correctAnswers,
              yourAnswer: response,
              marks: question.marks,
            });
          } else {
            this[section].incorrectQuestions.push({
              question: question,
              correctAnswer: question.correctAnswers,
              yourAnswer: response,
              marks: -1 * question.negativeMarks,
            });
          }
        } else {
          // Handle other types (e.g., MCQ_SINGLE or other question types)
          const isCorrect = response === question.correctAnswers[0]; // Assuming single correct answer

          if (isCorrect) {
            this[section].correctedQuestions.push({
              question: question,
              correctAnswer: question.correctAnswers[0],
              yourAnswer: response,
              marks: question.marks,
            });
          } else {
            this[section].incorrectQuestions.push({
              question: question,
              correctAnswer: question.correctAnswers[0],
              yourAnswer: response,
              marks: -1 * question.negativeMarks,
            });
          }
        }
      } else {
        // If not answered, mark as unattempted
        if (question.type === "MCQ_MULTIPLE") {
          this[section].unattemptedQuestions.push({
            question: question,
            correctAnswer: question.correctAnswers,
            yourAnswer: "Not Attempted",
            marks: 0,
          });
        } else {
          this[section].unattemptedQuestions.push({
            question: question,
            correctAnswer: question.correctAnswers[0],
            yourAnswer: "Not Attempted",
            marks: 0,
          });
        }
      }
    });
  }

  calculateScores() {
    // Calculate scores for each section
    this.score = {
      positive: 0,
      negative: 0,
      total: 0,
    };

    this.accuracy = 0;

    if (
      this.aptitude.correctedQuestions.length === 0 &&
      this.subject.correctedQuestions.length === 0 &&
      this.aptitude.incorrectQuestions.length === 0 &&
      this.subject.incorrectQuestions.length === 0
    ) {
      return;
    }

    // Aptitude section positive score
    this.aptitude.score.positive = parseFloat(
      this.aptitude.correctedQuestions
        .reduce((acc, curr) => {
          acc += curr.marks;
          return acc;
        }, 0)
        .toFixed(2)
    );

    // Aptitude section negative score
    this.aptitude.score.negative = parseFloat(
      this.aptitude.incorrectQuestions
        .reduce((acc, curr) => {
          acc += curr.marks;
          return acc;
        }, 0)
        .toFixed(2)
    );

    // Aptitude section total score
    this.aptitude.score.total = parseFloat(
      (this.aptitude.score.positive + this.aptitude.score.negative).toFixed(2)
    );

    // Aptitude section accuracy
    this.aptitude.accuracy = parseFloat(
      (
        100 *
        (this.aptitude.correctedQuestions.length /
          (this.aptitude.correctedQuestions.length +
            this.aptitude.incorrectQuestions.length))
      ).toFixed(2)
    );

    // Subject section positive score
    this.subject.score.positive = parseFloat(
      this.subject.correctedQuestions
        .reduce((acc, curr) => {
          acc += curr.marks;
          return acc;
        }, 0)
        .toFixed(2)
    );

    // Subject section negative score
    this.subject.score.negative = parseFloat(
      this.subject.incorrectQuestions
        .reduce((acc, curr) => {
          acc += curr.marks;
          return acc;
        }, 0)
        .toFixed(2)
    );

    // Subject section total score
    this.subject.score.total = parseFloat(
      (this.subject.score.positive + this.subject.score.negative).toFixed(2)
    );

    // Subject section accuracy
    this.subject.accuracy = parseFloat(
      (
        100 *
        (this.subject.correctedQuestions.length /
          (this.subject.correctedQuestions.length +
            this.subject.incorrectQuestions.length))
      ).toFixed(2)
    );

    // Calculate overall score
    this.score.positive = parseFloat(
      (this.aptitude.score.positive + this.subject.score.positive).toFixed(2)
    );
    this.score.negative = parseFloat(
      (this.aptitude.score.negative + this.subject.score.negative).toFixed(2)
    );
    this.score.total = Math.max(
      parseFloat(
        (this.aptitude.score.total + this.subject.score.total).toFixed(2)
      ),
      0
    );

    // Calculate overall accuracy
    this.accuracy = parseFloat(
      (
        100 *
        ((this.aptitude.correctedQuestions.length +
          this.subject.correctedQuestions.length) /
          (this.aptitude.correctedQuestions.length +
            this.aptitude.incorrectQuestions.length +
            this.subject.correctedQuestions.length +
            this.subject.incorrectQuestions.length))
      ).toFixed(2)
    );
  }

  giveRank(domain) {
    this.gateRank = "Not Ranked"; // Default value
    let rankTable = rankRanges[domain];
    let totalScore = this.score.total;
    for (let i = 0; i < rankTable.length; i++) {
      const range = rankTable[i];
      if (totalScore >= range.minScore && totalScore <= range.maxScore) {
        this.gateRank = range.rankRange;
        break;
      }
    }
  }
}

// Function to start the evaluation of the test attempt
async function startTestEvaluation(attempt) {
  // Check if the attempt is already evaluated
  try {
    const existingReport = await Report.findOne({ attemptId: attempt._id });
    if (existingReport) {
      console.log("Attempt already evaluated:", attempt._id);
      return;
    }

    // Start the evaluation process
    console.log("Starting evaluation for attempt:", attempt._id);
    const responses = attempt.responses;
    const allQuestions = await Question.find({
      packId: attempt.packId,
      testId: attempt.testId,
      domainId: attempt.domainId,
    })
      .select("_id -createdAt -updatedAt -uploadedBy")
      .lean();

    const result = new EvaluatedResult(attempt._id, responses, allQuestions);

    result.calculateScores(); // Calculate scores based on the responses

    result.giveRank(attempt.domainId); // Give rank based on the scores

    console.log("Evaluation completed for attempt:", attempt._id);
    console.log(result);

    // Save the evaluation result to the database
    const report = new Report(result);
    await report.save();

    // Update the status of the attempt to "evaluated"
    await TestAttempt.findByIdAndUpdate(attempt._id, { status: "evaluated" });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req) {
  try {
    // Parse the request body
    const { AttemptId, testPack, testNumber, domain } = await req.json();

    // Validate required fields
    if (!AttemptId || !testPack || !testNumber || !domain) {
      return new Response(
        JSON.stringify({
          error:
            "All fields (AttemptId, testPack, testNumber, domain) are required.",
        }),
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
      packId: testPack, // Use correct field names from the object
      testId: testNumber,
      domainId: domain,
    }).lean();

    // Handle case where no attempt is found
    if (!attempt) {
      return new Response(
        JSON.stringify({ error: "Test attempt not found." }),
        { status: 404 }
      );
    }

    if (attempt.status != "evaluated") {
      //start evaluation
      startTestEvaluation(attempt);
      return new Response(JSON.stringify(attempt), { status: 200 });
    }

    const report = await Report.findOne({ attemptId: attempt._id });

    // Return the fetched attempt
    return new Response(JSON.stringify({ ...attempt, report: report }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching unique test attempt:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch test attempt." }),
      { status: 500 }
    );
  }
}
