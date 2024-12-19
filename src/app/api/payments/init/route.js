import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { Payment } from "@/models/payments.models";
import connectDB from "@/libs/mongodb";
import { User } from "@/models/user.models";

// Initialize Razorpay instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY, // Add your Razorpay Key ID in .env
    key_secret: process.env.RAZORPAY_SECRET, // Add your Razorpay Key Secret in .env
});

export async function OPTIONS(req) {
    return NextResponse.json(
        { message: "Preflight request is successful" },
        { status: 200 }
    );
}

export async function POST(req) {
    // Extract data from the API call
    const { amount, receipt, user, test } = await req.json();

    // Connect to the database
    await connectDB();

    // Razorpay order creation options
    const options = {
        amount: amount, // Amount in paise
        currency: "INR", // INR currency
        receipt, // Receipt ID
    };

    try {
        // Create an order using Razorpay API
        const response = await instance.orders.create(options);

        // Save the order details in your database
        await Payment.create({
            amount: amount / 100, // Convert to rupees for storage
            updatedTime: response.created_at,
            receipt: receipt,
            orderId: response.id,
            status: "created",
            razorpayResponse: response, // Store the Razorpay response
            user: user._id, // Save the user ID
            test: test, // Store the test parameter
        });

        // Send the order details back as the API response
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error in creating Razorpay order:", error);

        // Send an error response back to the client
        return NextResponse.json(
            { message: "Problem in processing payments.", error: error.message },
            { status: 500 }
        );
    }
}
