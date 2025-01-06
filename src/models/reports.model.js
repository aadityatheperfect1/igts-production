import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  correctedQuestions: [{ type: Object, required: true }],
  incorrectQuestions: [{ type: Object, required: true }],
  unattemptedQuestions: [{ type: Object, required: true }],

  score: {
    positive: { type: Number, required: true },
    negative: { type: Number, required: true },
    total: { type: Number, required: true },
  },

  accuracy: { type: Number, required: true },
});

const ReportSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "TestAttempt",
    },
    aptitude: { type: SectionSchema, required: true },
    subject: { type: SectionSchema, required: true },
    gateRank: { type: String, required: true },
    score: {
      positive: { type: Number, required: true },
      negative: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    accuracy: { type: Number, required: true },
  },
  { timestamps: true }
);

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

module.exports = Report;
