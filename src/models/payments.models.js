import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        updatedTime: {
            type: Date,
            default: Date.now,
        },
        receipt: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            default: "",
        },
        signature: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            default: "created",
            enum: ["created", "paid"],
        },
        test: {
            type: String,
            default: null,
        },
        detailObject: {
            type: String,
        },
        razorpayResponse: {
            type: Object,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Payment =
    mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
