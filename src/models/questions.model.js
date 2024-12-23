const mongoose = require('mongoose');
const { Schema } = mongoose;

// Option Schema
const OptionSchema = new mongoose.Schema({
  optionId: {
    type: String,
    required: true // Identifier for the option (e.g., "a", "b")
  },
  optionText: {
    type: String,
    default: null // Text for the option (null if only image is present)
  },
  optionImage: {
    type: String,
    default: null // URL for the image of the option
  }
});

// Question Schema
const QuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true, // Unique identifier for the question
      unique: true
    },
    domainId: {
      type: String,
      required: true // Identifier for the domain (e.g., Mechanical, Electrical)
    },
    packId: {
      type: String,
      required: true // Identifier for the pack (e.g., Pack 1, Pack 2)
    },
    testId: {
      type: String,
      required: true // Identifier for the test (e.g., Test 1, Test 2)
    },
    section: {
      type: String,
      enum: ['aptitude', 'subject'], // Question section
      required: true
    },
    type: {
      type: String,
      enum: ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'NUMERICAL'], // Type of question
      required: true
    },
    questionText: {
      type: String,
      required: true // The main question text
    },
    diagramLink: {
      type: String,
      default: null // Optional link to a diagram/image associated with the question
    },
    options: {
      type: [OptionSchema], // Array of options (for MCQ questions)
      default: [] // Default empty array if no options are provided
    },
    correctAnswers: {
      type: [String], // Array of correct answer IDs (e.g., ["a"], ["a", "c"], or ["42"])
      required: true
    },
    marks: {
      type: Number,
      required: true // Marks for the question
    },
    negativeMarks: {
      type: Number,
      default: 0 // Negative marks for incorrect answers (optional)
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'], // Difficulty level
      default: 'medium' // Default value is "medium"
    },
    uploadedBy: {
      type: String,
      default: null // email of the uploader
    }
  },
  {
    timestamps: true,
  }
);


const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

export default Question;
