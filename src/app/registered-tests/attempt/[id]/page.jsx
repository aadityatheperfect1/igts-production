"use client"
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import style from "@/components/styles/attemptTest.module.css";
import NavbarLite from "@/components/NavbarLite";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import tests from "@/data/tests";
import toast from "react-hot-toast";

export default function AttemptTestLayout({ params }) {

    const pageParams = React.use(params);
    const RegisteredTestId = pageParams.id;
    const searchParams = useSearchParams();
    const testPack = searchParams.get('pack');
    const testNumber = searchParams.get('test');
    const domain = searchParams.get('domain');
    const [timeRemaining, setTimeRemaining] = useState("");
    const [testLive, setTestLive] = useState(false);
    const [testDate, setTestDate] = useState();
    const [attempting, setAttempting] = useState(false);
    const router = useRouter();
    const [isTestAttemptEnded, setIsTestAttemptEnded] = useState(false);


    const verifyRegisteredTestId = async (RegisteredTestId) => {
        try {
            const response = await fetch(`/api/verifyRegisteredTestId`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ RegisteredTestId }),
            });

            const result = await response.json();

            if (response.ok && result.valid) {
                return true; // ID is verified
            } else {
                return false; // ID is invalid
            }
        } catch (error) {
            return false;
        }
    };

    // Example usage in a React component
    const [verified, setVerified] = useState(false);

    const checkRegisteredTestId = async () => {
        const isValid = await verifyRegisteredTestId(pageParams.id);
        setVerified(isValid);
    };

    useEffect(() => {
        checkRegisteredTestId(); // Call the function on component mount
    }, []);

    // State for storing the specific test details
    const [testDetails, setTestDetails] = useState(null);

    // Normalize the `testPack` string to match the keys in `testSchedule`
    const normalizePackName = (pack) => {
        switch (pack) {
            case "Pack 1":
                return "pack1";
            case "Pack 2":
                return "pack2";
            case "Pack 1 + Pack 2 (Both)":
                return "pack1pack2both";
            default:
                return null;
        }
    };

    // Normalize the `testNumber` string to match the keys in `testSchedule`
    const normalizeTestName = (testName) => {
        if (!testName || typeof testName !== 'string') return null; // Handle invalid input

        // Extract the number from the string and capitalize the first letter
        const match = testName.match(/^test(\d+)$/i);
        return match ? `Test ${match[1]}` : testName;
    };

    // Fetch test details based on the query parameters
    useEffect(() => {
        const normalizedPack = normalizePackName(testPack); // Normalize the pack name
        const domainTest = tests.find((test) => test.title === domain);

        if (domainTest && normalizedPack && domainTest.testSchedule[normalizedPack]) {
            setTestDetails({
                title: domainTest.title,
                date: domainTest.testSchedule[normalizedPack][testNumber],
            });
            setTestDate(domainTest.testSchedule[normalizedPack][testNumber]);
        } else {
            setTestDetails(null); // Handle invalid parameters
        }
    }, [domain, testPack, testNumber]);

    const formatDateString = (dateString) => {
        return dateString.replace(/(\d+)(st|nd|rd|th)/, "$1"); // Remove ordinal suffix
    };



    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (testDate) {
                // Parse and format the test date
                const formattedDate = formatDateString(testDate);
                const testDateTime = new Date(`${formattedDate} 00:02:00`);
                const testEndDateTime = new Date(`${formattedDate} 00:04:00`);
                const now = new Date();

                if (now >= testDateTime && now <= testEndDateTime) {
                    // Test is live
                    setTestLive(true);
                    setIsTestAttemptEnded(false);
                    const timeDiff = testEndDateTime - now;

                    const hours = String(Math.floor((timeDiff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                    const minutes = String(Math.floor((timeDiff / (1000 * 60)) % 60)).padStart(2, '0');
                    const seconds = String(Math.floor((timeDiff / 1000) % 60)).padStart(2, '0');

                    setTimeRemaining(`${hours} : ${minutes} : ${seconds} Hrs`);
                } else if (now > testEndDateTime) {
                    // Test has ended
                    setTestLive(false);
                    setIsTestAttemptEnded(true);
                    setTimeRemaining("");
                } else {
                    // Test has not started yet
                    setTestLive(false);
                    setIsTestAttemptEnded(false);
                    const timeDiff = testDateTime - now;

                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = String(Math.floor((timeDiff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                    const minutes = String(Math.floor((timeDiff / (1000 * 60)) % 60)).padStart(2, '0');
                    const seconds = String(Math.floor((timeDiff / 1000) % 60)).padStart(2, '0');

                    setTimeRemaining(`${days > 0 ? `${days} days, ` : ""}${hours} : ${minutes} : ${seconds} Hrs`);
                }
            }
        };

        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(timer); // Cleanup on component unmount
    }, [testDate]);





    if (verified) {
        return (
            <div>
                <nav className={`fixed top-0 left-0 bg-white border-b border-black pt-8 lg:pt-4 pb-4 pr-4 pl-4 items-center sticky`}>
                    <div className={`mx-0 xl:mx-28 flex items-center`}>
                        <div className={``}>
                            <div>
                                <Image
                                    src="/images/logo.png"
                                    alt="Website Logo"
                                    className="hidden md:inline-block"
                                    width={60} // Set width to match the display size of the image
                                    height={60} // Adjust height based on the aspect ratio of your image
                                    priority // Optionally, add this if it’s an important image (e.g., above-the-fold content)
                                />
                            </div>
                            <div>
                                <Image
                                    src="/images/logo_half.png"
                                    alt="Website Logo"
                                    className="md:hidden"
                                    width={60} // Set width to match the display size of the image
                                    height={60} // Adjust height based on the aspect ratio of your image
                                    priority // Optionally, add this if it’s an important image (e.g., above-the-fold content)
                                />
                            </div>
                        </div>
                    </div>
                </nav>
                <section className={`${style.topSection} w-full text-white pt-2 pb-4`}>
                    <div
                        className={`sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5`}
                    >
                        {testDetails ? (
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-10">
                                <div className="flex-col flex justify-center gap-2 w-full md:w-2/3">
                                    <h2 className="text-2xl md:text-4xl font-normal tracking-wide mb-3">
                                        GATE Mock - {testDetails.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 items-center text-neutral-50">
                                        <p className="text-md bg-purple-100 text-black md:text-lg px-4 rounded-full font-medium border border-neutral-100">
                                            <span className="font-normal">{testPack}</span>
                                        </p>

                                        <p className="text-md md:text-lg flex gap-2 items-center">
                                            <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                            {normalizeTestName(testNumber)}
                                        </p>

                                        <p className="text-md md:text-lg font-medium flex gap-2 items-center">
                                            <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                            {testDetails.date}
                                        </p>

                                        <p className="font-normal text-md md:text-lg flex items-center gap-2">
                                            <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed">
                                                <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
                                            </svg>
                                            180 MIN
                                        </p>

                                        <p className="text-md md:text-lg font-medium flex gap-2 items-center">
                                            <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                            5:30 - 8:30 PM
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <p className="flex gap-2 items-center text-md md:text-xl">
                                            Test Mode:
                                            <span className="rounded-md text-sm md:text-md text-green-400 border border-neutral-100 px-2">
                                                Online
                                            </span>
                                        </p>
                                    </div>
                                    <div className="w-full mt-4 text-sm md:text-lg text-neutral-50">
                                        <p>
                                            Note: Please read all the instructions carefully before attempting the test. Ensure you are in a distraction-free environment before you begin, as timing and accuracy are key. Best of luck, and give it your best shot!
                                        </p>
                                    </div>
                                    <div className="border border-gray-200 text-sm md:text-lg mt-2 text-purple-100 px-4 py-2 rounded-lg">
                                        <p>
                                            You may begin the test at any time between 5:30 - 8:30 PM. The timer will start only when you press &#34;Attempt Test&#34;
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 hidden md:flex justify-center md:justify-end">
                                    <img
                                        className="w-2/3 md:w-3/4 object-contain"
                                        src="/images/test-details-bg.svg"
                                        alt="Test Details Background"
                                    />
                                </div>
                            </div>

                        ) : (
                            <p className="text-center text-lg">Invalid test details provided.</p>
                        )}
                    </div>
                </section>
                <section className={`mb-32`}>
                    <div className="sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5">
                        <h1 className="text-3xl font-bold">Questions</h1>
                        <p className="text-lg mt-4">
                            The total number of questions in this test is <span className="font-semibold">65</span>.
                        </p>
                        <p className="text-lg mt-2">
                            Out of these, <span className="font-semibold">10</span> questions will be from <span className="font-semibold">Aptitude</span>, and <span className="font-semibold">55</span> questions will be from the <span className="font-semibold">Subject</span>.
                        </p>

                        <div className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">Marking Scheme</h2>
                            <ul className="space-y-3">
                                <li className="text-lg">
                                    <span className="font-semibold">Aptitude:</span> 5 Questions with <span className="text-green-600 font-semibold">+1</span> for each correct & <span className="text-red-600 font-semibold">-1/3</span> for each incorrect.
                                </li>
                                <li className="text-lg">
                                    <span className="font-semibold">Aptitude:</span> 5 Questions with <span className="text-green-600 font-semibold">+2</span> for each correct & <span className="text-red-600 font-semibold">-2/3</span> for each incorrect.
                                </li>
                                <li className="text-lg">
                                    <span className="font-semibold">Subject:</span> 25 Questions with <span className="text-green-600 font-semibold">+1</span> for each correct & <span className="text-red-600 font-semibold">-1/3</span> for each incorrect.
                                </li>
                                <li className="text-lg">
                                    <span className="font-semibold">Subject:</span> 30 Questions with <span className="text-green-600 font-semibold">+2</span> for each correct & <span className="text-red-600 font-semibold">-2/3</span> for each incorrect.
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6">
                            <p className="text-lg font-medium">
                                <span className="font-bold">Note:</span> No negative marks for <span className="font-semibold">MSQ</span> & <span className="font-semibold">Numerical Type Questions</span>.
                            </p>
                        </div>
                    </div>

                </section>
                <div className="relative">
                    {/* Floating horizontal bar */}
                    <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-neutral-200">
                        <div className="sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex justify-between items-center p-4">
                            {/* Countdown or Test Live Message */}
                            <div className="text-xl font-medium text-gray-700">
                                {testLive ? (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-green-600 font-semibold text-xl">The test is live!</span>
                                        <span className="text-gray-700 text-lg">
                                            You have <span className="font-semibold text-blue-600">{timeRemaining}</span> remaining to start the test
                                        </span>
                                    </div>
                                ) : isTestAttemptEnded ? (
                                    <span className="text-red-600 font-semibold text-lg">This test has ended</span>
                                ) : (
                                    <span className="text-gray-700 text-lg flex flex-wrap">
                                        <span>The test will begin in</span> <span className="font-semibold text-blue-600">{timeRemaining}</span>
                                    </span>
                                )}



                            </div>

                            {/* Attempt Test Now Button */}
                            {!testLive && !isTestAttemptEnded && (
                                <button
                                    onClick={() =>
                                        toast("The test has not started yet.", { icon: "⏳" })
                                    }
                                    className="bg-gray-600 hover:bg-gray-700 text-white text-lg font-medium px-6 py-2 md:px-6 md:py-3 rounded-md cursor-not-allowed"
                                >
                                    Attempt Test
                                </button>
                            )}

                            {!testLive && isTestAttemptEnded && (
                                <button
                                    onClick={() =>
                                        toast("This test has ended. Thank you for participating!", { icon: "🚫" })
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white text-lg font-medium px-6 py-2 md:px-6 md:py-3 rounded-md cursor-not-allowed"
                                >
                                    Test Ended
                                </button>
                            )}

                            {testLive && (
                                <button
                                    onClick={() => {
                                        setAttempting(true);
                                        router.push(
                                            `/registered-tests/attempt-live/${RegisteredTestId}?domain=${encodeURIComponent(domain)}&pack=${encodeURIComponent(testPack)}&test=${encodeURIComponent(testNumber)}`
                                        );
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-6 py-2 md:px-6 md:py-3 rounded-md"
                                >
                                    Attempt Test
                                </button>
                            )}



                        </div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="topSection min-h-screen bg-gray-100">
                <NavbarLite />
                <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">

                        <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                            <div className={``}><Loader /></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}