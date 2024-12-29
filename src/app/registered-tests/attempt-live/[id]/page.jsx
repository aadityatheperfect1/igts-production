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
import axios from "axios";
import useScreenSize from "@/hooks/useMobile";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { firebaseConfig } from "@/app/firebase/config";
import { initializeApp } from "firebase/app";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from "firebase/auth";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from "firebase/auth";
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';


export default function AttemptLive({ params }) {

    const isMobile = useScreenSize();
    const [userDetails, setUserDetails] = useState(null);
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [uid, setUid] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isInFullScreen, setIsInFullScreen] = useState(false);
    const [isTestReady, setIsTestReady] = useState(false);
    const [isTestLoading, setIsTestLoading] = useState(null);
    const [testQuestions, setTestQuestions] = useState([]);
    const [expandedSection, setExpandedSection] = useState("aptitude"); // Default to Aptitude
    const aptitudeQuestions = testQuestions.slice(0, 10);
    const subjectQuestions = testQuestions.slice(10);
    const [testStartTime, setTestStartTime] = useState(null);
    const [testEndTime, setTestEndTime] = useState(null);
    const [testTimeRemaining, setTestTimeRemaining] = useState("");
    const [isTestOver, setIsTestOver] = useState(false);
    const [isAlreadyAttempted, setIsAlreadyAttempted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);



    function LoadAuth() {
        initializeApp(firebaseConfig);
        const auth = getAuth();
        const dispatch = useDispatch();
        const uid = useSelector((state) => state.auth.uid);

        useEffect(() => {
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    dispatch(setUID(user.uid));
                    dispatch(fetchUserDetails(user.uid));
                } else {
                    dispatch(clearAuth());
                }
            });

            return () => unsubscribe();
        }, [dispatch]);
    }

    LoadAuth();


    const getUser = async (id) => {
        try {
            const res = await fetch("/api/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: id }),
            });
            const resjson = await res.json();
            if (res.status === 200) {
                setUserDetails(resjson.user);
                setUserRole(resjson.user.role);
                setUid(resjson.user.userId);
            } else {
                toast.error("Failed to get user details.")
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        if (user) {
            getUser(user.uid);
            setIsFirstLoad(false);
        }
    }, [user]);

    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [previousResponses, setPreviousResponses] = useState(responses);
    const selectedQuestion = testQuestions[selectedQuestionIndex];


    // Function to render LaTeX content
    const renderLatex = (text) => {
        try {
            const html = katex.renderToString(text, { throwOnError: false });
            return { __html: html };
        } catch (error) {
            console.error("Error rendering LaTeX:", error);
            return { __html: text };
        }
    };

    // Handle MCQ Selection
    const handleMCQSelection = (questionId, optionId, isMultiple) => {
        setResponses((prevResponses) => {
            const newResponses = { ...prevResponses };
            if (isMultiple) {
                const selectedOptions = newResponses[questionId] || [];
                if (selectedOptions.includes(optionId)) {
                    newResponses[questionId] = selectedOptions.filter((id) => id !== optionId);
                } else {
                    newResponses[questionId] = [...selectedOptions, optionId];
                }
            } else {
                newResponses[questionId] = optionId;
            }
            return newResponses;
        });
    };

    // Handle numerical input
    const handleNumericalInput = (questionId, value) => {
        setResponses((prevResponses) => ({
            ...prevResponses,
            [questionId]: value,
        }));
    };

    const handleNextQuestion = async () => {
        const payloadTemp = formatTestData(RegisteredTestId, testPack, testNumber, domain);
        const payload = {
            userId: userDetails._id, // Replace with actual user ID
            registeredTestId: payloadTemp.RegisteredTestId, // Replace with actual registered test ID
            domainId: payloadTemp.domain, // Replace with actual domain ID
            packId: payloadTemp.testPack, // Replace with actual pack ID
            testId: payloadTemp.testNumber, // Replace with actual test ID
            responses, // User's responses
        };

        // Compare the current responses with the previously saved responses
        if (JSON.stringify(responses) === JSON.stringify(previousResponses)) {
            // Navigate to the next question without making an API call
            if (selectedQuestionIndex < testQuestions.length - 1) {
                setSelectedQuestionIndex(selectedQuestionIndex + 1);
            }
            return;
        }

        try {
            // Show loading toast
            const toastId = toast.loading("Saving your progress...");

            // Call the API to save responses
            const response = await axios.post("/api/test/save-test-while-attempting", payload);

            if (response.status === 200) {
                // Dismiss the loading toast and show success message
                toast.dismiss(toastId);
                toast.success("Progress saved successfully!");

                // Update the previousResponses state to the current responses
                setPreviousResponses(responses);

                // Navigate to the next question
                if (selectedQuestionIndex < testQuestions.length - 1) {
                    setSelectedQuestionIndex(selectedQuestionIndex + 1);
                }
            }
        } catch (error) {
            console.error("Error saving test progress:", error);
            // Show error toast
            toast.error("Failed to save your progress. Please try again.");
        }
    };


    // Navigate to the previous question
    const handlePreviousQuestion = () => {
        if (selectedQuestionIndex > 0) {
            setSelectedQuestionIndex(selectedQuestionIndex - 1);
        }
    };


    useEffect(() => {
        const handleFullScreenChange = () => {
            // Detect full-screen using both the Full-Screen API and window size
            setIsFullscreen(!!document.fullscreenElement || window.innerHeight === screen.height);
            setIsInFullScreen(!!document.fullscreenElement || window.innerHeight === screen.height);
        };

        // Add event listeners for both fullscreenchange and resize
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        window.addEventListener('resize', handleFullScreenChange);

        // Cleanup listeners on component unmount
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            window.removeEventListener('resize', handleFullScreenChange);
        };
    }, []);

    const collapseAnimation = {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
    };


    useEffect(() => {
        // Disable right-click
        const disableRightClick = (e) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', disableRightClick);

        // Disable text selection
        const disableTextSelection = (e) => {
            e.preventDefault();
        };
        document.addEventListener('selectstart', disableTextSelection);

        // Disable copying
        const disableCopy = (e) => {
            e.preventDefault();
        };
        document.addEventListener('copy', disableCopy);

        // Disable specific key combinations and inspect options
        const disableKeyCombinations = (e) => {
            if (
                (e.ctrlKey && e.key === 'c') || // Ctrl+C
                (e.metaKey && e.key === 'c') || // Command+C for macOS
                (e.ctrlKey && e.key === 'u') || // Ctrl+U (View Source)
                (e.ctrlKey && e.shiftKey && e.key === 'i') || // Ctrl+Shift+I (DevTools)
                (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I (DevTools)
                (e.ctrlKey && e.shiftKey && e.key === 'j') || // Ctrl+Shift+J (Console)
                (e.ctrlKey && e.shiftKey && e.key === 'c') || // Ctrl+Shift+C (Inspect Element)
                (e.ctrlKey && e.key === 'j') || // Ctrl+j (Downloads)
                // e.key === 'F12' || // F12 (DevTools)
                e.key === 'PrintScreen' // PrintScreen key
            ) {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', disableKeyCombinations);

        // Cleanup event listeners on unmount
        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('selectstart', disableTextSelection);
            document.removeEventListener('copy', disableCopy);
            document.removeEventListener('keydown', disableKeyCombinations);
        };
    }, []);


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
                const testDateTime = new Date(`${formattedDate} 17:30:00`);
                const testEndDateTime = new Date(`${formattedDate} 20:30:00`);
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

    // function to format the api call payload data
    const formatTestData = (RegisteredTestId, testPack, testNumber, domain) => {
        // Format the domain
        const domainMapping = {
            "Aerospace Engineering": "Aerospace",
            "Electronics and Communication Engineering": "ECE",
            "Mechanical Enigneering": "Mechanical",
            "Physics": "Physics",
        };

        const formattedDomain = domainMapping[domain] || domain;

        // Format the testNumber
        const testNumberMapping = {
            test1: "Test 1",
            test2: "Test 2",
            test3: "Test 3",
            test4: "Test 1",
            test5: "Test 2",
            test6: "Test 3",
        };

        const formattedTestNumber = testNumberMapping[testNumber] || testNumber;

        // Format the testPack
        let formattedTestPack = testPack;
        if (testPack === "Pack 1 + Pack 2 (Both)") {
            if (["test1", "test2", "test3"].includes(testNumber)) {
                formattedTestPack = "Pack 1";
            } else if (["test4", "test5", "test6"].includes(testNumber)) {
                formattedTestPack = "Pack 2";
            }
        }

        // Return the formatted data
        return {
            RegisteredTestId,
            testPack: formattedTestPack,
            testNumber: formattedTestNumber,
            domain: formattedDomain,
        };
    };

    // Function to fetch test questions
    const fetchTestQuestions = async () => {
        setIsTestLoading(true);
        const payload = formatTestData(RegisteredTestId, testPack, testNumber, domain);
        try {
            const response = await fetch('/api/testConduction/fetchQuestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payload
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            setTestQuestions(data.questions);
            setIsTestReady(true);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsTestLoading(false);
        }
    };


    useEffect(() => {
        if (selectedQuestionIndex <= 9) {
            setExpandedSection('aptitude');
        }
        else if (selectedQuestionIndex > 9) {
            setExpandedSection('subject');
        }
    }, [selectedQuestionIndex]);

    const handleClearSelection = (questionId) => {
        setResponses((prevResponses) => ({
            ...prevResponses,
            [questionId]: selectedQuestion.type === "MCQ_MULTIPLE" ? [] : null, // Clear the response (empty array for multiple choice, null for single choice)
        }));
    };



    const startTest = async () => {
        // Format the payload data
        const payloadTemp = formatTestData(RegisteredTestId, testPack, testNumber, domain);
        const payload = {
            userId: userDetails._id, // Replace with actual user ID
            registeredTestId: payloadTemp.RegisteredTestId, // Replace with actual registered test ID
            domainId: payloadTemp.domain, // Replace with actual domain ID
            packId: payloadTemp.testPack, // Replace with actual pack ID
            testId: payloadTemp.testNumber, // Replace with actual test ID
        };

        try {
            // Call the API
            const response = await fetch("/api/test/attempt-test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            // Parse the response
            const result = await response.json();

            if (response.ok) {
                // Check if the test attempt already exists or was just created
                const { message, attempt } = result;

                if (message === "Test attempt already exists.") {
                    if (attempt.status === "completed" || attempt.status === "evaluated") {
                        toast.error("You have already attempted this test and cannot attempt it again.");
                        setIsTestLoading(false);
                        setIsTestReady(false);
                        setIsAlreadyAttempted(true);
                    } else if (attempt.status === "attempting") {
                        setTestStartTime(new Date(attempt.startTime));
                        setTestEndTime(new Date(attempt.endTime));
                        setResponses(attempt.responses);
                        fetchTestQuestions();

                    }
                }
                else if (message === "New test attempt created.") {
                    setTestStartTime(new Date(attempt.startTime));
                    setTestEndTime(new Date(attempt.endTime));
                    fetchTestQuestions();

                }

            } else {
                // Handle API errors
                console.error("Error starting test:", result.error);
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            // Handle network or other unexpected errors
            console.error("Failed to start test:", error);
            toast.error("An unexpected error occurred while starting the test.");
        }
    };



    useEffect(() => {

        if (!testStartTime || !testEndTime) {
            return;
        }

        const timer = setInterval(() => {
            const now = new Date();
            const remainingTime = testEndTime.getTime() - now.getTime();

            if (remainingTime <= 0) {
                clearInterval(timer);
                setTestTimeRemaining("00 : 00 : 00");
                setIsTestOver(true);
            } else {
                setTestTimeRemaining(formatTime(remainingTime));
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [testStartTime, testEndTime]);

    // Format the remaining time into HH : MM : SS
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${hours} : ${minutes} : ${seconds}`;
    };



    const endTest = async (responses) => {
        // Format the payload data
        const payloadTemp = formatTestData(RegisteredTestId, testPack, testNumber, domain);
        const payload = {
            userId: userDetails._id, // Replace with actual user ID
            registeredTestId: payloadTemp.RegisteredTestId, // Replace with actual registered test ID
            domainId: payloadTemp.domain, // Replace with actual domain ID
            packId: payloadTemp.testPack, // Replace with actual pack ID
            testId: payloadTemp.testNumber, // Replace with actual test ID
            responses, // User's responses
            timeRemainingOnCompletion: testTimeRemaining,
        };

        try {
            // Call the API
            const response = await fetch("/api/test/end-test-attempt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            // Parse the response
            const result = await response.json();

            if (response.ok) {
                // Success message
                toast.success("Test ended successfully.");
                setIsTestOver(true);
                setIsSubmitted(true);
            } else {
                // Handle API errors
                console.error("Error ending test:", result.error);
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            // Handle network or other unexpected errors
            console.error("Failed to end test:", error);
            toast.error("An unexpected error occurred while ending the test.");
        }
    };



    useEffect(() => {
        if (isTestOver) {
            toast.loading("Saving your Test Responses.. Please don't refresh the page...");
            endTest(responses);
            toast.dismiss();
        }
    }, [isTestOver]);

    const handleSubmit = () => {
        // Ask for confirmation
        const isConfirmed = confirm("Are you sure you want to end and submit the test?");
        if (!isConfirmed) return; // If the user cancels, exit the function

        // Show loading toast
        const toastId = toast.loading("Saving Your test...");
        try {
            // Call endTest with responses
            endTest(responses);

            // Simulate a delay if needed (e.g., API call)
            setTimeout(() => {
                // Dismiss loading toast and show success message
                toast.dismiss(toastId);
                toast.success("Your test has been saved successfully!");

                // Set isSubmitted to true
                setIsSubmitted(true);
            }, 1000); // Simulating 1 second delay
        } catch (error) {
            // Handle any errors and show an error toast
            toast.dismiss(toastId);
            toast.error("An error occurred while saving your test.");
        }
    };




    if (isMobile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Access Restricted</h1>
                    <p className="text-lg mt-4">Please use a tablet or PC to attempt the test.</p>
                </div>
            </div>
        );
    }

    if (isAlreadyAttempted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
                    {/* Red Warning SVG */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-red-500 mb-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 8a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z"
                            clipRule="evenodd"
                        />
                    </svg>

                    {/* Message */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Test Already Attempted
                    </h1>
                    <p className="text-gray-600 text-center">
                        It seems you have already attempted this test. Thank you for your participation!
                    </p>

                    {/* Button to Navigate */}
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        Go Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
                    {/* Green Check SVG */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-green-500 mb-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.293 13.707l-4-4a1 1 0 111.414-1.414l2.293 2.293 5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>

                    {/* Message */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Submission Successful!
                    </h1>
                    <p className="text-gray-600 text-center">
                        Your responses have been successfully submitted. Thank you for your time and effort!
                    </p>

                    {/* Button to Navigate */}
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    if (verified) {
        if (!attempting) {
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
                    <section className={`${style.topSection} w-full text-white pt-6 pb-3`}>
                        <div
                            className={`sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5`}
                        >
                            {testDetails ? (
                                <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10">
                                    <div className="flex-col flex gap-4 justify-center items-center w-full md:w-2/3 ">
                                        <h2 className="text-2xl md:text-4xl font-normal tracking-wide mb-3">
                                            GATE Mock - {testDetails.title}
                                        </h2>
                                        <div>
                                            <p className="text-sm bg-purple-100 text-black md:text-lg px-4 rounded-full font-medium border border-neutral-100">
                                                <span className="font-normal">{testPack}</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 items-center text-neutral-50">
                                            <p className="text-sm md:text-lg flex gap-2 items-center">
                                                <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                                {normalizeTestName(testNumber)}
                                            </p>

                                            <p className="text-sm md:text-lg font-medium flex gap-2 items-center">
                                                <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                                {testDetails.date}
                                            </p>

                                            <p className="font-normal text-sm md:text-lg flex items-center gap-2">
                                                <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed">
                                                    <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
                                                </svg>
                                                180 MIN
                                            </p>

                                            <p className="text-sm md:text-lg font-medium flex gap-2 items-center">
                                                <span className="text-neutral-300 font-normal text-lg md:text-2xl leading-none flex items-center">•</span>
                                                5:30 - 8:30 PM
                                            </p>
                                        </div>

                                        <div className="">
                                            <p className="flex gap-2 items-center text-md md:text-xl">
                                                Test Mode:
                                                <span className="rounded-md text-sm md:text-md text-green-400 border border-neutral-100 px-2">
                                                    Online
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-xl font-medium text-gray-700 w-full">
                                            {testLive ? (
                                                <div className="flex flex-col items-center justify-center gap-2 bg-green-100 px-4 py-4 rounded-md">
                                                    <span className="text-green-600 font-semibold text-xl">The test is live!</span>
                                                    <span className="text-gray-700 text-lg">
                                                        You have <span className="font-semibold text-blue-600 ">{timeRemaining}</span> remaining to start the test
                                                    </span>
                                                </div>
                                            ) : isTestAttemptEnded ? (
                                                <div className="flex flex-col items-center justify-center gap-2 bg-red-100 px-4 py-4 rounded-md">
                                                    <span className="text-red-600 font-semibold text-lg rounded-md">This test has ended</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2 bg-blue-100 px-4 py-4 rounded-md">
                                                    <span className="text-gray-700 text-lg">
                                                        The test will begin in <span className="font-semibold text-blue-600 rounded-md">{timeRemaining}</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {!testLive && !isTestAttemptEnded && (
                                                <button
                                                    onClick={() =>
                                                        toast("The test has not started yet. Please wait.", { icon: "⏳" })
                                                    }
                                                    className="transition duration-300 ease-in-out bg-gray-600 hover:bg-gray-700 text-white text-lg font-medium px-6 py-2 w-full rounded-md cursor-not-allowed"
                                                >
                                                    Start Test
                                                </button>
                                            )}

                                            {!testLive && isTestAttemptEnded && (
                                                <button
                                                    onClick={() =>
                                                        toast("This test has ended. Thank you for participating!", { icon: "🚫" })
                                                    }
                                                    className="transition duration-300 ease-in-out bg-red-600 hover:bg-red-700 text-white text-lg font-medium px-6 py-2 w-full rounded-md cursor-not-allowed"
                                                >
                                                    Test Ended
                                                </button>
                                            )}

                                            {testLive && (
                                                <button
                                                    onClick={() => {
                                                        setAttempting(true);
                                                        setIsFullscreen(true);
                                                        if (document.documentElement.requestFullscreen) {
                                                            document.documentElement.requestFullscreen(); // Standard Fullscreen API
                                                        } else if (element.webkitRequestFullscreen) {
                                                            document.documentElement.webkitRequestFullscreen(); // Safari
                                                        } else if (element.mozRequestFullScreen) {
                                                            document.documentElement.mozRequestFullScreen(); // Firefox
                                                        } else if (element.msRequestFullscreen) {
                                                            document.documentElement.msRequestFullscreen(); // IE/Edge
                                                        }
                                                        setIsTestLoading(true);
                                                        startTest();
                                                    }}
                                                    className="transition duration-300 ease-in-out bg-green-600 hover:bg-green-700 text-white text-lg font-medium px-6 py-2 w-full rounded-md"
                                                >
                                                    Start Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            ) : (
                                <p className="text-center text-lg">Invalid test details provided.</p>
                            )}
                        </div>
                    </section>
                </div>
            )
        }
        else if (attempting) {
            return (
                <div>
                    {!isInFullScreen && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(19, 29, 62, 0.7)', // Darker for better focus
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 9999,
                                textAlign: 'center',
                                padding: '20px',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '1.5rem', // Responsive font size
                                    fontWeight: '500', // Emphasize the text
                                    marginBottom: '20px', // Space below the text
                                }}
                            >
                                Please switch to full-screen mode to continue.
                            </p>
                            <button
                                onClick={() => {
                                    if (document.documentElement.requestFullscreen) {
                                        document.documentElement.requestFullscreen(); // Standard Fullscreen API
                                    } else if (element.webkitRequestFullscreen) {
                                        document.documentElement.webkitRequestFullscreen(); // Safari
                                    } else if (element.mozRequestFullScreen) {
                                        document.documentElement.mozRequestFullScreen(); // Firefox
                                    } else if (element.msRequestFullscreen) {
                                        document.documentElement.msRequestFullscreen(); // IE/Edge
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    backgroundColor: '#4CAF50', // A green button
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
                                onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
                            >
                                Enable Full-Screen Mode
                            </button>
                        </div>

                    )}



                    {isTestLoading && !isTestReady ?
                        <div className="bg-white min-h-screen bg-gray-100">
                            <NavbarLite />
                            <div className="min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-120px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                                <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">

                                    <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                                        <div className={``}><Loader /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="">
                            <div className="flex-grow border-gray-300 max-h-screen">
                                <div className="grid grid-cols-10 gap-4 rounded-xl border-gray-300 shadow-md">
                                    {/* Left Panel - Question List */}
                                    <div className="col-span-2 space-y-1 bg-white rounded-xl border-r border-gray-300 shadow-lg min-h-screen">
                                        {/* Title */}
                                        <h3 className="text-center text-md lg:text-xl bg-blue-600 text-white py-4 font-semibold rounded-tr-xl">
                                            IGTS GATE Mock
                                        </h3>

                                        <div className="">
                                            {/* Aptitude Section */}
                                            <div>
                                                <div
                                                    className="w-full py-3 text-lg text-white px-4 border border-gray-300 bg-blue-600 hover:bg-blue-500 shadow-md cursor-pointer"
                                                    onClick={() => setExpandedSection("aptitude")}
                                                >
                                                    <p className={`flex justify-between items-center`}>
                                                        <span>Aptitude</span>
                                                        <motion.span
                                                            animate={expandedSection === "aptitude" ? { rotate: 180 } : { rotate: 0 }}
                                                            initial={false}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                        >
                                                            ⏷
                                                        </motion.span>
                                                    </p>
                                                </div>
                                                <AnimatePresence>
                                                    {expandedSection === "aptitude" && (
                                                        <motion.div
                                                            className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar"
                                                            {...collapseAnimation}
                                                        >
                                                            <ul className="list-none p-0 m-0">
                                                                {aptitudeQuestions.map((question, index) => (
                                                                    <li
                                                                        key={question._id}
                                                                        onClick={() => setSelectedQuestionIndex(index)}
                                                                        className={`p-4 cursor-pointer transition ease-in-out duration-200 ${index === selectedQuestionIndex
                                                                            ? "bg-gray-200 text-black hover:bg-gray-300"
                                                                            : "hover:bg-gray-50"
                                                                            } border-b border-gray-300`}
                                                                    >
                                                                        <b>{`QUESTION ${index + 1}`}</b>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Subject Section */}
                                            <div className="mt-1">
                                                <div
                                                    className="w-full py-3 text-lg text-white px-4 border border-gray-300 bg-blue-600 hover:bg-blue-500 transition ease-in-out duration-200 shadow-md cursor-pointer"
                                                    onClick={() => setExpandedSection("subject")}
                                                >
                                                    <p className={`flex justify-between items-center`}>
                                                        <span>Subject</span>
                                                        <motion.span
                                                            animate={expandedSection === "subject" ? { rotate: 180 } : { rotate: 0 }}
                                                            initial={false}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                        >
                                                            ⏷
                                                        </motion.span>
                                                    </p>                                             </div>
                                                <AnimatePresence>
                                                    {expandedSection === "subject" && (
                                                        <motion.div
                                                            className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar"
                                                            {...collapseAnimation}
                                                        >
                                                            <ul className="list-none p-0 m-0">
                                                                {subjectQuestions.map((question, index) => (
                                                                    <li
                                                                        key={question._id}
                                                                        onClick={() => setSelectedQuestionIndex(index + 10)} // Offset index for Subject questions
                                                                        className={`p-4 cursor-pointer transition ease-in-out duration-200 ${index + 10 === selectedQuestionIndex
                                                                            ? "bg-gray-200 text-black hover:bg-gray-300"
                                                                            : "hover:bg-gray-50"
                                                                            } border-b border-gray-300`}
                                                                    >
                                                                        <b>{`QUESTION ${index + 11}`}</b>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Display Selected Question */}
                                    <motion.div
                                        className="col-span-7 p-8 pr-0 w-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {selectedQuestion ? (
                                            <motion.div
                                                initial={{ x: 300, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 50 }}
                                                className={`w-full flex flex-col items-between justify-between min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-120px)] xl:min-h-[calc(100vh-140px)]`}
                                            >
                                                <div className={`space-y-3`}>
                                                    <div className="bg-white">
                                                        {/* Question Header */}
                                                        <div className="grid grid-cols-2 justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
                                                            {/* Question Number */}
                                                            <h2 className="text-blue-600 w-full text-3xl font-semibold flex items-center">
                                                                Question {selectedQuestionIndex + 1}
                                                            </h2>

                                                            <div className={`flex justify-end w-full gap-4`}>
                                                                {/* Time Remaining */}
                                                                <div className="flex items-center shadow-sm justify-between text-gray-600 border border-neutral-300 px-6 py-2 rounded-md w-56">
                                                                    {/* SVG Icon */}
                                                                    <img className="h-8 w-8" src="/images/chronometer.png" alt="chronometer" />

                                                                    {/* Time Remaining Text */}
                                                                    <h2 className="text-2xl font-bold text-center w-full">{testTimeRemaining}</h2>
                                                                </div>

                                                                {/* Submit Button */}
                                                                <button
                                                                    onClick={handleSubmit}
                                                                    disabled={isSubmitted} // Disable button if already submitted
                                                                    className="flex gap-2 items-center bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-103"
                                                                >
                                                                    Submit Test
                                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                                                                        <path d="M444-240h72v-150l57 57 51-51-144-144-144 144 51 51 57-57v150ZM263.72-96Q234-96 213-117.15T192-168v-624q0-29.7 21.15-50.85Q234.3-864 264-864h312l192 192v504q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72ZM528-624v-168H264v624h432v-456H528ZM264-792v189-189 624-624Z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>



                                                        {/* Question Details */}
                                                        <div className="text-gray-700 mb-3 gap-2 flex items-center">
                                                            <p>
                                                                <span className="font-semibold text-gray-900">Section: </span>
                                                                {selectedQuestion.section.toUpperCase()}
                                                            </p>
                                                            {" | "}
                                                            <p>
                                                                <span className="font-semibold text-gray-900">Type: </span>
                                                                {selectedQuestion.type.replace("_", " ")}
                                                            </p>
                                                            {" | "}
                                                            <p>
                                                                <span className="font-semibold text-gray-900">Question ID: </span>
                                                                {selectedQuestion.questionId}
                                                            </p>
                                                            {" | "}
                                                            <p>
                                                                <span className="font-semibold text-gray-900">Difficulty: </span>
                                                                {selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1).toLowerCase()}
                                                            </p>
                                                        </div>

                                                        {/* Question Text */}
                                                        <div
                                                            className="text-gray-800 text-lg leading-relaxed"
                                                            dangerouslySetInnerHTML={renderLatex(selectedQuestion.questionText)}
                                                        ></div>
                                                        {selectedQuestion.diagramLink === "" ? ''
                                                            : <div>
                                                                <img className={`w-1/3`} src={`${selectedQuestion.diagramLink}`} alt="" />
                                                            </div>
                                                        }
                                                    </div>

                                                    {/* Options */}
                                                    <div className="grid gap-4">
                                                        {selectedQuestion.type === "MCQ_SINGLE" || selectedQuestion.type === "MCQ_MULTIPLE" ? (
                                                            selectedQuestion.options.map((option) => (
                                                                <div
                                                                    key={option.optionId}
                                                                    className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition duration-200 ease-in-out 
                            ${responses[selectedQuestion._id] === option.optionId || responses[selectedQuestion._id]?.includes(option.optionId)
                                                                            ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'} 
                            hover:bg-green-50`}
                                                                    onClick={() =>
                                                                        handleMCQSelection(
                                                                            selectedQuestion._id,
                                                                            option.optionId,
                                                                            selectedQuestion.type === "MCQ_MULTIPLE"
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        {responses[selectedQuestion._id] === option.optionId || responses[selectedQuestion._id]?.includes(option.optionId) ? (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" height={'22px'} width={'22px'} viewBox="0 -960 960 960" fill="#34A399" stroke="currentColor"><path d="M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q63 0 120 19t105 54l-52 52q-37-26-81-39.5T480-792q-130 0-221 91t-91 221q0 130 91 221t221 91q130 0 221-91t91-221q0-21-3-41.5t-8-40.5l57-57q13 32 19.5 67t6.5 72q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm-55-211L264-468l52-52 110 110 387-387 51 51-439 439Z" /></svg>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" height={'22px'} width={'22px'} viewBox="0 -960 960 960" fill="gray" stroke="currentColor"><path d="M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q63 0 120 19t105 54l-52 52q-37-26-81-39.5T480-792q-130 0-221 91t-91 221q0 130 91 221t221 91q130 0 221-91t91-221q0-21-3-41.5t-8-40.5l57-57q13 32 19.5 67t6.5 72q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm-55-211L264-468l52-52 110 110 387-387 51 51-439 439Z" /></svg>
                                                                        )}
                                                                        <label
                                                                            htmlFor={`option-${option.optionId}`}
                                                                            className="text-gray-700 text-base cursor-pointer"
                                                                            dangerouslySetInnerHTML={renderLatex(option.optionText)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : selectedQuestion.type === "NUMERICAL" ? (
                                                            <input
                                                                type="float"
                                                                value={responses[selectedQuestion._id] || ""}
                                                                onChange={(e) => handleNumericalInput(selectedQuestion._id, e.target.value)}
                                                                className="px-4 py-3 w-full mt-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                                                placeholder="Enter your answer"
                                                            />
                                                        ) : null}

                                                        {/* Clear Button */}
                                                        <div>
                                                            {selectedQuestion.type === "MCQ_SINGLE" || selectedQuestion.type === "MCQ_MULTIPLE" ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleClearSelection(selectedQuestion._id)}
                                                                    className="mt-4 px-6 py-3 flex bg-red-500 text-white rounded-md hover:bg-red-600 transition ease-in-out duration-500  focus:outline-none"
                                                                >
                                                                    Clear Selection
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </div>


                                                </div>

                                                {/* Navigation Buttons */}
                                                <div className="mt-6 gap-4 flex justify-between w-full">
                                                    <button
                                                        onClick={handlePreviousQuestion}
                                                        disabled={selectedQuestionIndex === 0}
                                                        className={`py-6 px-10 flex gap-2 justify-start items-center text-md w-full border border-neutral-300 transition ease-in-out duration-500 font-semibold rounded-md ${selectedQuestionIndex === 0
                                                            ? "bg-gray-50 cursor-not-allowed text-neutral-400"
                                                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                                                            }`}
                                                    >
                                                        <span>
                                                            {selectedQuestionIndex === 0
                                                                ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#A0A0A0"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
                                                                : <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#606060"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
                                                            }
                                                        </span>
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={handleNextQuestion}
                                                        disabled={selectedQuestionIndex === testQuestions.length}
                                                        className={`py-6 px-10 flex gap-2 justify-end items-center text-md w-full text-white border border-neutral-300 transition ease-in-out duration-500 font-semibold rounded-md ${selectedQuestionIndex === testQuestions.length
                                                            ? "bg-blue-300 cursor-not-allowed"
                                                            : "bg-blue-500 hover:bg-blue-600"
                                                            }`}
                                                    >
                                                        Save & Next
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
                                                        </span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <p className="text-center text-gray-600">No question selected.</p>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>}

                </div>
            );
        }
    }
    else {
        return (
            <div className="topSection min-h-screen bg-gray-100">
                <NavbarLite />
                <div className="min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-120px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
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