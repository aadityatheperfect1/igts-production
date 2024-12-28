"use client";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div>
            <div className="min-h-screen topSection flex flex-col items-center w-full mx-auto pb-20">
                <Navbar />
                <main className="px-6 py-10 max-w-4xl text-left">
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <p className="mb-4">
                        <strong>Effective Date:</strong> 28th December 2024
                    </p>
                    <p className="mb-4">
                        Welcome to IGTS GATE Mock Test! Your privacy is of utmost importance to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and services. By using our website and services, you agree to the terms outlined in this Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
                    <p className="mb-4">We collect the following information to provide and enhance our services:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>
                            <strong>During Registration:</strong> Email and password for email authentication or your Google account details for Google-based login.
                        </li>
                        <li>
                            <strong>After Authentication:</strong> Additional details such as your name, email address, phone number, college name, and branch.
                        </li>
                        <li>
                            <strong>Payment Information:</strong> Payments are securely processed via RazorPay Payment Gateway. After a successful payment, we store the Payment ID, amount paid, and payment status in our database for registration and record-keeping purposes. Sensitive payment details like card numbers or banking credentials are not stored by us.
                        </li>
                        <li>
                            <strong>Test Portal Usage:</strong> Information related to test attempts, scores, and performance metrics is collected for analytics and service improvement.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>To create and manage your account.</li>
                        <li>To register you for the GATE Mock Test and provide access to the test portal.</li>
                        <li>To process payments securely and verify registration.</li>
                        <li>To communicate important updates, notifications, and reminders about the tests.</li>
                        <li>To analyze your performance data and improve our offerings.</li>
                        <li>To comply with legal requirements and obligations.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">3. How We Protect Your Information</h2>
                    <p className="mb-4">
                        We employ robust security measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Secure data encryption for sensitive information.</li>
                        <li>Regular system audits to identify and mitigate vulnerabilities.</li>
                        <li>Secure payment processing through trusted third-party gateways like RazorPay.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">4. Sharing of Your Information</h2>
                    <p className="mb-4">
                        We do not sell or rent your personal information. However, we may share your data in the following cases:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>
                            <strong>Payment Processing:</strong> With RazorPay to complete secure transactions.
                        </li>
                        <li>
                            <strong>Service Providers:</strong> With trusted third-party service providers to support our operations and deliver services.
                        </li>
                        <li>
                            <strong>Legal Obligations:</strong> To comply with applicable laws or to protect our rights and property.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">5. Cookies and Tracking Technologies</h2>
                    <p className="mb-4">
                        Our website uses cookies and tracking technologies to personalize your experience and improve our services. You can manage or disable cookies through your browser settings.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights</h2>
                    <p className="mb-4">You have the following rights regarding your personal data:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Access and update your personal information at any time.</li>
                        <li>Request a copy of your data for portability.</li>
                        <li>Request deletion of your account and associated data, subject to legal retention requirements.</li>
                        <li>Opt-out of receiving promotional emails or messages.</li>
                    </ul>
                    <p className="mb-4">
                        To exercise your rights, please contact us at <strong>dhanak2k25@gmail.com</strong>.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">7. Third-party Links</h2>
                    <p className="mb-4">
                        Our website may contain links to external websites. We are not responsible for the privacy practices or content of those websites. Please review their privacy policies before providing any personal information.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">8. Children’s Privacy</h2>
                    <p className="mb-4">
                        Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us immediately.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">9. Changes to this Privacy Policy</h2>
                    <p className="mb-4">
                        We may update this Privacy Policy periodically. Updates will be posted on this page with the updated effective date.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
                    <p className="mb-4 flex flex-col">
                        For any questions, concerns, or feedback regarding this Privacy Policy, please contact us at:
                        <span>
                            <strong>Email:</strong> dhanak2k25@gmail.com
                        </span>
                        <span>
                            <strong>Phone:</strong> +91 6200117093
                        </span>
                    </p>
                </main>
            </div>
            <Footer />
        </div>
    );
}
