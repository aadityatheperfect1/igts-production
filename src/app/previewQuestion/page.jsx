"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast, { Toaster } from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import style from '@/components/styles/dashboardCSS.module.css';
import Loader from "@/components/Loader";
import Link from "next/link";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

import katex from "katex";
import "katex/dist/katex.min.css";




export default function PreviewQuestion() {

    const [userDetails, setUserDetails] = useState(null);
    const router = useRouter();
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [uid, setUid] = useState('');
    const [questionId, setQuestionId] = useState("");
    const [questionData, setQuestionData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFetchQuestion = async (e) => {
        e.preventDefault();
        setError("");
        setQuestionData(null);

        if (!questionId) {
            setError("Please enter a valid question ID.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("/api/fetchQuestionById", {
                questionId,
            });

            setQuestionData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch question.");
        } finally {
            setLoading(false);
        }
    };

    const renderLatex = (text) => {
        try {
            const html = katex.renderToString(text, { throwOnError: false });
            return { __html: html };
        } catch (error) {
            console.error("Error rendering LaTeX:", error);
            return { __html: text };
        }
    };


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


    if (!userRole) {
        return (
            <div className="topSection min-h-screen bg-gray-100">
                <Navbar />
                <LoadAuth />
                <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">

                        <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                            <div className={``}><Loader /></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (userRole === 'testAdmin') {
        return (
            <div className={`topSection min-h-screen`}>
                <Navbar />
                <div className={`bg-white sm:max-w-3xl md:max-w-6xl xl:max-w-7xl min-h-screen xl:mx-auto m-2 sm:m-3 md:m-4 lg:m-8 xl:my-12 font-bold rounded-2xl overflow-hidden shadow-lg border border-black ${style.fonttAverta}`}>
                    <div className={`bg-[#1e91d6] w-full py-4`}>
                        <div className={`grid justify-center items-center`}>
                            <div className={``}>
                                <h1 className={`text-neutral-50 text-2xl md:text-3xl lg:text-3xl xl:text-3xl`}>
                                    Preview Question
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={`w-full py-4`}>

                        <div className="mx-auto bg-white shadow-md rounded-md p-6">
                            <h1 className="text-2xl font-bold mb-4">Fetch Question by ID</h1>

                            <form onSubmit={handleFetchQuestion} className="mb-6">
                                <label htmlFor="questionId" className="block text-lg font-medium mb-2">
                                    Enter Question ID:
                                </label>
                                <input
                                    type="text"
                                    id="questionId"
                                    value={questionId}
                                    onChange={(e) => setQuestionId(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                    placeholder="Enter question ID"
                                />
                                <button
                                    type="submit"
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Fetch Question
                                </button>
                            </form>

                            {loading && <p>Loading...</p>}

                            {error && (
                                <p className="text-red-500 font-medium">
                                    {error}
                                </p>
                            )}

                            {questionData && (
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    {/* Section Header */}
                                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 border-b-2 border-gray-200 pb-2">
                                        Question Details
                                    </h2>

                                    {/* General Information */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <strong>Question ID:</strong> {questionData.questionId}
                                        </div>
                                        <div>
                                            <strong>Domain ID:</strong> {questionData.domainId}
                                        </div>
                                        <div>
                                            <strong>Pack ID:</strong> {questionData.packId}
                                        </div>
                                        <div>
                                            <strong>Test ID:</strong> {questionData.testId}
                                        </div>
                                        <div>
                                            <strong>Section:</strong> {questionData.section}
                                        </div>
                                        <div>
                                            <strong>Type:</strong> {questionData.type}
                                        </div>
                                        <div>
                                            <strong>Difficulty:</strong> {questionData.difficulty}
                                        </div>
                                        <div>
                                            <strong>Marks:</strong> {questionData.marks}
                                        </div>
                                        <div>
                                            <strong>Negative Marks:</strong> {questionData.negativeMarks}
                                        </div>
                                        <div>
                                            <strong>Uploaded By:</strong> {questionData.uploadedBy || "N/A"}
                                        </div>
                                    </div>

                                    {/* Question Section */}
                                    <div className="bg-blue-50 p-6 rounded-lg mb-6 shadow-inner">
                                        <h3 className="text-lg font-semibold text-blue-700 mb-4">
                                            Question Text
                                        </h3>
                                        <div
                                            className="text-gray-800"
                                            dangerouslySetInnerHTML={renderLatex(questionData.questionText)}
                                        ></div>
                                        {questionData.diagramLink && (
                                            <div className="mt-4">
                                                <strong>Diagram:</strong>
                                                <img
                                                    src={questionData.diagramLink}
                                                    alt="Diagram"
                                                    className="mt-2 max-w-full rounded-md shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Options Section */}
                                    {questionData.options.length > 0 && (
                                        <div className="bg-green-50 p-6 rounded-lg mb-6 shadow-inner">
                                            <h3 className="text-lg font-semibold text-green-700 mb-4">
                                                Options
                                            </h3>
                                            <ul className="space-y-4">
                                                {questionData.options.map((option, index) => (
                                                    <li
                                                        key={index}
                                                        className="bg-white p-4 rounded-md shadow flex flex-col sm:flex-row items-start sm:items-center"
                                                    >
                                                        <p className={`flex gap-2`}>
                                                            <span
                                                                className={`text-gray-800 flex-1`}>
                                                                {option.optionId})
                                                            </span>
                                                            <span
                                                                className="text-gray-800 flex-1"
                                                                dangerouslySetInnerHTML={renderLatex(
                                                                    option.optionText || ""
                                                                )}
                                                            ></span>
                                                        </p>
                                                        {option.optionImage && (
                                                            <img
                                                                src={option.optionImage}
                                                                alt={`Option ${option.optionId}`}
                                                                className="mt-2 sm:mt-0 sm:ml-4 max-w-xs rounded-md shadow-md"
                                                            />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Correct Answers Section */}
                                    <div className="bg-yellow-50 p-4 rounded-lg shadow-inner">
                                        <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                                            Correct Answers
                                        </h3>
                                        <div className="text-gray-800">
                                            {questionData.correctAnswers.join(", ")}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
                <Footer />
            </div>
        )
    }
    else {
        return (
            <div className="topSection min-h-screen bg-gray-100">
                <Navbar />
                <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">

                        <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                            <p className="text-center text-sm md:text-lg lg:text-lg font-semibold">
                                You are <span className="text-red-500 font-semibold">NOT</span> allowed to preview Questions
                            </p>
                            <p className="text-center font-semibold flex flex-wrap justify-center items-center gap-2 text-sm md:text-lg lg:text-lg">
                                Please
                                <Link className="text-blue-500 hover:underline font-semibold" href="/sign-in">
                                    login
                                </Link>
                                with an Admin account.
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
}