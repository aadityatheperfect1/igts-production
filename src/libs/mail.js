import nodemailer from "nodemailer";

export async function sendMail({
    to,
    name = "Recipient",
    subject,
    body
}) {
    // For Gmail SMTP
    // const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

    // // Check if SMTP credentials are available
    // if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    //     console.error("SMTP credentials are missing.");
    //     return;
    // }

    // const transport = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: SMTP_EMAIL,
    //         pass: SMTP_PASSWORD,
    //     }
    // });

    // For GoDaddy Professional Email SMTP
    let transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    // Verify the transport connection
    try {
        const testResult = await transport.verify();
        console.log("SMTP connection verified:", testResult);
    } catch (error) {
        console.error("SMTP connection verification failed:", error);
        return;
    }

    // Send the email
    try {
        const sendResult = await transport.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html: `<p>${body}</p>`
        });
        console.log("Email sent successfully:", sendResult);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}
