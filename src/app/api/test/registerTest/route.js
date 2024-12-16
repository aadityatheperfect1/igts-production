import { NextResponse } from "next/server";

// Handle the POST request for test registration
export async function POST(req) {
    try {
        // Parse the incoming request body
        const { pid, oid, signature, tname, test } = await req.json();

        // Log the received data for testing purposes
        console.log("Received data:");
        console.log("Payment ID:", pid);
        console.log("Order ID:", oid);
        console.log("Signature:", signature);
        console.log("Name:", tname);
        console.log("Test:", test);

        // Respond with a success message
        return NextResponse.json(
            {
                message: "Test registration data received successfully.",
                data: { pid, oid, signature, tname, test }, // Echo back the data for verification
            },
            { status: 200 }
        );
    } catch (error) {
        // Log any errors and return a failure response
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
