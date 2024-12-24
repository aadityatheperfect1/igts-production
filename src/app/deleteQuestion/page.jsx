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
import { use, useEffect, useState } from "react";
import style from '@/components/styles/dashboardCSS.module.css';
import Loader from "@/components/Loader";
import Link from "next/link";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

import katex from "katex";
import "katex/dist/katex.min.css";




export default function DeleteQuestionPage() {

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
    const [successMessage, setSuccessMessage] = useState("");

    const handleDeleteQuestion = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!questionId) {
            setError("Please enter a valid question ID.");
            return;
        }

        setLoading(true);

        try {
            toast.loading("Deleting Question...");
            const response = await axios.post("/api/deleteQuestionById", {
                questionId,
            });

            setSuccessMessage(response.data.message || "Question deleted successfully.");
            toast.dismiss();
            toast.success("Question deleted successfully.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete question.");
            toast.dismiss();
            toast.error("Failed to delete question.");
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
                <div className={`min-h-screen`}>
                    <div className={`sm:max-w-3xl md:max-w-6xl xl:max-w-7xl xl:mx-auto m-2 sm:m-3 md:m-4 lg:m-8 xl:my-12 font-bold rounded-2xl overflow-hidden ${style.fonttAverta}`}>
                        <div className={`w-full`}>

                            <div className="max-w-lg mx-auto bg-gray-800 text-white shadow-lg rounded-lg p-8">
                                <h1 className="text-3xl font-bold text-center mb-6 text-red-400">
                                    Delete Question by ID
                                </h1>

                                <form onSubmit={handleDeleteQuestion} className="space-y-4">
                                    {/* Input Field */}
                                    <div>
                                        <label htmlFor="questionId" className="block text-lg font-medium mb-2">
                                            Enter Question ID:
                                        </label>
                                        <input
                                            type="text"
                                            id="questionId"
                                            value={questionId}
                                            onChange={(e) => setQuestionId(e.target.value)}
                                            className="w-full border border-gray-600 rounded-md px-4 py-2 bg-gray-900 text-white focus:outline-none focus:border-red-500"
                                            placeholder="Enter a valid question ID"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Delete Question
                                    </button>
                                </form>

                                {/* Feedback Section */}
                                <div className="mt-6">
                                    {loading && (
                                        <p className="text-yellow-400 font-medium text-center">
                                            Processing your request...
                                        </p>
                                    )}

                                    {error && (
                                        <p className="text-red-500 font-medium text-center">
                                            {error}
                                        </p>
                                    )}

                                    {successMessage && (
                                        <p className="text-green-500 font-medium text-center">
                                            {successMessage}
                                        </p>
                                    )}
                                </div>
                            </div>


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
                                You are <span className="text-red-500 font-semibold">NOT</span> allowed to Delete Questions
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