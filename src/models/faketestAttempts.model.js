import mongoose from "mongoose";
import User from "./user.models";
import TestRegistration from "./testRegistrations.models";

// Define the test attempt schema
const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User collection
    },
    registeredTestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "TestRegistration", // Reference to the RegisteredTest collection
    },
    domainId: {
      type: String, // Simple string instead of ObjectId
      required: true,
    },
    packId: {
      type: String, // Simple string instead of ObjectId
      required: true,
    },
    testId: {
      type: String, // Simple string instead of ObjectId
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["attempting", "completed", "evaluated"],
      default: "attempting",
    },
    timeRemainingOnCompletion: {
      type: String,
      default: "",
    },
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Allows mixed types (e.g., string, array, number)
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent model overwriting in development
const FakeTestAttempt =
  mongoose.models.FakeTestAttempt ||
  mongoose.model("FakeTestAttempt", testAttemptSchema);

module.exports = FakeTestAttempt;
