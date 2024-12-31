"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import style from "@/components/styles/resultsAnalysis.module.css";
import toast from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import store from '@/libs/store';
import { onAuthStateChanged } from "firebase/auth";

export default function ResultsAnalysis({ params }) {

    const pageParams = React.use(params);

    const AttemptId = pageParams.id;

    const searchParams = useSearchParams();
    const testPack = searchParams.get('pack');
    const testNumber = searchParams.get('test');
    const domain = searchParams.get('domain');
    const [userDetails, setUserDetails] = useState(null);
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [testAttempt, setTestAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userObjectId, setUserObjectId] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);


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
                setUserObjectId(resjson.user._id);
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

    useEffect(() => {
        const fetchUniqueAttempt = async () => {
            try {
                const testPack = searchParams.get("pack");
                const testNumber = searchParams.get("test");
                const domain = searchParams.get("domain");

                if (!userObjectId || !testPack || !testNumber || !domain) {
                    throw new Error("Missing required parameters");
                }

                // Payload for the request
                const payload = {
                    AttemptId,
                    testPack,
                    testNumber,
                    domain,
                };

                // POST request to fetch the unique test attempt
                const response = await fetch("/api/fetchUniqueAttempt", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch unique attempt");
                }

                const data = await response.json();
                setTestAttempt(data); // Update the state with the fetched data
            } catch (error) {
                console.error("Error fetching unique test attempt:", error);
                setError("An error occurred while fetching the unique test attempt.");
            } finally {
                setLoading(false);
            }
        };

        if (userObjectId) {
            fetchUniqueAttempt();
        }
    }, [userObjectId, searchParams]);

    const convertToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsLeft = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
    };

    const calculateTimeTaken = (timeRemaining) => {
        const totalTime = convertToSeconds("03:00:00");
        const timeRemainingInSeconds = convertToSeconds(timeRemaining);
        const timeTakenInSeconds = totalTime - timeRemainingInSeconds;
        return formatTime(timeTakenInSeconds);
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen bg-gray-100">
                <Navbar />
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

    if (error) {
        return (
            <div className="bg-white min-h-screen bg-gray-100">
                <Navbar />
                <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">
                        <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
                            <div className={``}>{error}</div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (


        <div className="topSection min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-6 mb-8 mx-auto px-4 md:px-8">
                <div className="w-full min-h-screen pt-10 pb-6 px-4 md:px-10 bg-white font-semibold traking-wider rounded-md shadow-xs border border-gray-300 mx-auto">
                    <div className="space-y-6">
                        <div
                            key={testAttempt._id}
                            className="schedule-card rounded-xl pt-4 pb-3 px-4 md:py-6 md:px-4"
                        >
                            <div className="flex-col space-y-4 md:space-y-0 md:flex md:flex-row justify-between md:px-4">
                                <div className={`flex md:gap-3`}>
                                    <div className="h-full hidden md:inline-block">
                                        <img
                                            src="/images/assignTestIcons.svg"
                                            alt="Assign Test Icon"
                                            className="w-12 object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 md:gap-0">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            GATE Mock for {testAttempt.domainId}
                                        </h2>
                                        <div className="flex flex-row items-center items-center space-y-2 md:space-y-0 gap-2">
                                            <p className="text-[#1d7dea] font-semibold text-sm bg-gray-50 rounded-full px-4 border border-gray-300">
                                                {testAttempt.packId}
                                            </p>
                                            <p className="text-neutral-600 font-normal text-2xl">•</p>
                                            <p className="text-[#222222] font-semibold text-md flex items-center gap-2">
                                                {testAttempt.testId}
                                            </p>
                                        </div>
                                        <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                                            <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                            <p className="text-[#1d7dea] font-semibold text-md flex items-center gap-2">
                                                Status:
                                                {testAttempt.status === 'completed' ? <span className={`font-normal text-green-600`}>{testAttempt.status.charAt(0).toUpperCase() + testAttempt.status.slice(1)}</span> : ''}
                                                {testAttempt.status === 'attempting' ? <span className={`font-normal text-yellow-600`}>{testAttempt.status.charAt(0).toUpperCase() + testAttempt.status.slice(1)}</span> : ''}
                                                {/* <span className={`text-[#222222]`}>{testAttemptstatus}</span> */}
                                            </p>
                                            <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                            <p className={`text-[#1d7dea] font-semibold text-md flex items-center gap-2`}>
                                                Test Mode:
                                                <span className={`rounded-sm border text-sm text-purple-500 border-neutral-300 px-2`}>
                                                    Online
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                                            <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                            <p className="text-[#222222] font-normal text-md flex items-center gap-2">
                                                <span className={`text-[#1d7dea] font-semibold`}>Start Time:</span> {new Date(testAttempt.startTime).toLocaleString()}
                                            </p>
                                            <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                            <p className="text-[#222222] font-normal text-md flex items-center gap-2">
                                                <span className={`text-[#1d7dea] font-semibold`}>End Time:</span> {new Date(testAttempt.endTime).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={`flex gap-2 mt-2 text-[#222222] text-sm font-normal`}>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`w-full flex-col space-y-6 justify-center items-center mt-12 md:mt-20`}>
                        <div className={`w-full flex items-center justify-center`}>
                            <div className={`${style.typewriter}`}>
                                <div className={style.slide}><i></i></div>
                                <div className={style.paper}></div>
                                <div className={style.keyboard}></div>
                            </div>
                        </div>
                        <div className={`text-sm md:text-md text-center`}>
                            Evaluation is under progress... It will be ready soon. Please check again later.
                        </div>
                    </div>


                </div>
            </div>
            <Footer />
        </div>
    );
}
