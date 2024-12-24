"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import style from '@/components/styles/dashboardCSS.module.css';
import Loader from "@/components/Loader";
import katex from "katex";
import { onAuthStateChanged } from "firebase/auth";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import "katex/dist/katex.min.css";
import Link from "next/link";

export default function PreviewQuestion() {
    const [user] = useAuthState(getAuth());
    const [questionId, setQuestionId] = useState("");
    const [questionData, setQuestionData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestionText, setEditedQuestionText] = useState("");
    const [editedOptions, setEditedOptions] = useState([]);

    const auth = getAuth();
    const [userRole, setUserRole] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [uid, setUid] = useState('');
    const [userDetails, setUserDetails] = useState(null);




    useEffect(() => {
        initializeApp(firebaseConfig);
    }, []);

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
            setEditedQuestionText(response.data.questionText);
            setEditedOptions(response.data.options);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch question.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuestion = async () => {
        if (!editedQuestionText || editedOptions.length === 0) {
            toast.error("Please provide valid question text and options.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/updateQuestion", {
                questionId,
                questionText: editedQuestionText,
                options: editedOptions,
            });

            if (response.status === 200) {
                toast.success("Question updated successfully!");
                setQuestionData({ ...questionData, questionText: editedQuestionText, options: editedOptions });
                setIsEditing(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update question.");
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
            <div className="topSection min-h-screen">
                <Navbar />
                <div className={`container max-w-7xl mx-auto mt-8 min-h-screen`}>

                    <div className={`bg-white sm:max-w-3xl md:max-w-6xl xl:max-w-7xl xl:mx-auto m-2 sm:m-3 md:m-4 lg:m-8 xl:my-12 font-bold rounded-2xl overflow-hidden shadow-lg border border-black ${style.fonttAverta}`}>
                        <div className={`bg-[#1e91d6] w-full py-4`}>
                            <div className={`grid justify-center items-center`}>
                                <div className={``}>
                                    <h1 className={`text-neutral-50 text-2xl md:text-3xl lg:text-3xl xl:text-3xl`}>
                                        Edit Question
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className={`w-full p-0 md:p-10`}>
                            <form onSubmit={handleFetchQuestion} className="m-6 md:mb-6">
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

                            {loading && <Loader />}
                            {error && <p className="text-red-500 font-medium">{error}</p>}

                            {questionData && (
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                        Question Details
                                    </h2>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <label className="text-lg font-medium">Question ID:</label>
                                            <p className="text-gray-700">{questionData.questionId}</p>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            <label className="text-lg font-medium">Question Type:</label>
                                            <p className="text-gray-700">{questionData.type}</p>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            <label className="text-lg font-medium">Correct Answer:</label>
                                            <p className="text-gray-700">{questionData.correctAnswers}</p>
                                        </div>
                                    </div>


                                    {isEditing ? (
                                        <div className="mb-6 overflow-auto">
                                            <label className="block text-lg font-medium mb-2">
                                                Question Text:
                                            </label>
                                            <textarea
                                                value={editedQuestionText}
                                                onChange={(e) => setEditedQuestionText(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-4 py-2 overflow-auto"
                                                rows={4}
                                            />
                                            <label className="block text-lg font-medium mb-2">
                                                Question Preview:
                                            </label>
                                            <div
                                                className="text-gray-800 bg-gray-100 border border-gray-300 rounded-md px-4 py-2"
                                                dangerouslySetInnerHTML={renderLatex(editedQuestionText)}
                                            ></div>

                                            <label className="block text-lg font-medium mt-4 mb-2">
                                                Options:
                                            </label>
                                            {editedOptions.map((option, index) => (
                                                <div key={index} className="mb-2">
                                                    <input
                                                        type="text"
                                                        value={option.optionText}
                                                        onChange={(e) => {
                                                            const updatedOptions = [...editedOptions];
                                                            updatedOptions[index].optionText = e.target.value;
                                                            setEditedOptions(updatedOptions);
                                                        }}
                                                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                    <label>
                                                        Preview:
                                                    </label>
                                                    <div
                                                        className="text-gray-800 border bg-gray-100 border-gray-300 rounded-md px-4 py-2"
                                                        dangerouslySetInnerHTML={renderLatex(option.optionId + ")~ " + option.optionText)}
                                                    ></div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={handleUpdateQuestion}
                                                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="bg-blue-50 p-6 rounded-lg mb-6 shadow-inner">
                                                <h3 className="text-lg font-semibold text-blue-700 mb-4">
                                                    Question Text
                                                </h3>
                                                <div
                                                    className="text-gray-800"
                                                    dangerouslySetInnerHTML={renderLatex(questionData.questionText)}
                                                ></div>
                                            </div>
                                            <div className="bg-green-50 p-6 rounded-lg mb-6 shadow-inner">
                                                <h3 className="text-lg font-semibold text-green-700 mb-4">
                                                    Options
                                                </h3>
                                                <ul className="space-y-4">
                                                    {questionData.options.map((option, index) => (
                                                        <li
                                                            key={index}
                                                            className="bg-white p-4 rounded-md shadow flex flex-col"
                                                        >
                                                            <div
                                                                className="text-gray-800"
                                                                dangerouslySetInnerHTML={renderLatex(option.optionId + ")~" + option.optionText)}
                                                            ></div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>


                </div>
                <Footer />
            </div>
        );
    }
    else {
        return (
            <div className="topSection min-h-screen bg-gray-100">
                <Navbar />
                <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">

                        <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                            <p className="text-center text-sm md:text-lg lg:text-lg font-semibold">
                                You are <span className="text-red-500 font-semibold">NOT</span> allowed to edit Questions
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
