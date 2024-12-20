import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/libs/mongodb"; // Ensure you have a DB connection utility
import User from "@/models/user.models";
import { Payment } from "@/models/payments.models";
import TestRegistrations from "@/models/testRegistrations.models";
import crypto from "crypto";
import { registrationEmail } from '@/components/registrationEmail'
import mail, { sendMail } from "@/libs/mail";



export async function POST(req) {
    try {
        // Parse and validate the incoming request body
        const body = await req.json();
        const requiredFields = ["pid", "oid", "signature", "name", "test", "userId"];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ message: `${field} is required.` }, { status: 400 });
            }
        }

        const { pid, oid, signature, name, test, userId } = body;

        // Ensure the database is connected
        await dbConnect();

        // Fetch the user object using the userId
        const currUser = await User.findOne({ userId });
        if (!currUser) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        // Fetch the payment object using the order ID
        const payment = await Payment.findOne({ orderId: oid });
        if (!payment) {
            return NextResponse.json({ message: "Payment record not found." }, { status: 404 });
        }

        // Check if a registration for the same test already exists for the user
        const userObjId = currUser._id;
        const existingRegistration = await TestRegistrations.findOne({
            userId: userObjId,
            test
        });

        if (existingRegistration) {
            return NextResponse.json(
                { message: "User is already registered for this test." },
                { status: 409 }
            );
        }

        const cryptoObj = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        const generatedSign = cryptoObj.update(oid + "|" + pid).digest("hex");

        if (generatedSign === signature) {
            // Update the payment object
            payment.paymentId = pid;
            payment.signature = signature;
            payment.status = "paid";
            payment.updatedTime = Date.now(); // Update the timestamp
            await payment.save();


            // Create a new test registration object
            const newRegistration = await TestRegistrations.create({
                pid,
                oid,
                signature,
                name,
                test,
                userId: currUser._id.toString(), // Convert ObjectId to String
                payment: payment._id.toString(), // Ensure payment._id is also converted to string
            });

            // Update the currUser's registeredTests array atomically
            currUser.registeredTests.push(newRegistration._id);
            await currUser.save();

            const send = async (to, name, subject, body) => {
                "use server"
                await sendMail({ to, name, subject, body });  // Pass as an object
            };

            const [testName, pack] = test.split(",").map(part => part.trim());

            await send(`${currUser.email}, aadityatheperfect1@gmail.com, mohinthaKumar12gd@gmail.com `, currUser.name, "IGTS Registration Successful", registrationEmail(name, pid, testName, pack, payment.amount, currUser.email));  // Await the send function

            // Return a success response
            return NextResponse.json(
                {
                    message: "Test registration successful.",
                    registration: newRegistration,
                },
                { status: 200 }
            );
        }

    } catch (error) {
        console.error("Error handling test registration request:", error);
        return NextResponse.json(
            { message: "Failed to process the request.", error: error.message },
            { status: 500 }
        );
    }
}

// Handle the OPTIONS request for preflight (CORS handling)
export async function OPTIONS() {
    return NextResponse.json(
        { message: "Preflight request is successful" },
        { status: 200 }
    );
}
