"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import style from "@/components/styles/attemptTest.module.css";
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

export default function DashboardResults() {
    const [userDetails, setUserDetails] = useState(null);
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [testAttempts, setTestAttempts] = useState([]);
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
        const fetchTestAttempts = async () => {
            try {
                // Replace with the actual user ID (get it from the user session or context)
                // const userId = "676964ed22977aaa57c67eaf"; // Example user ID
                console.log(userObjectId);
                const userId = userObjectId;
                // const userId = userDetails._id;
                // Make a POST request to fetch the test attempts
                const response = await fetch("/api/fetchAllAttempts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch attempts");
                }

                const data = await response.json();
                setTestAttempts(data);
            } catch (error) {
                console.error("Error fetching test attempts:", error);
                setError("An error occurred while fetching the test attempts.");
            } finally {
                setLoading(false);
            }
        };
        if (userObjectId) {
            fetchTestAttempts();
        }
    }, [userObjectId]);

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
                    <h2 className="font-bold text-3xl mb-6 text-center">Your Test Attempts</h2>
                    {testAttempts.length === 0 ? (
                        <div>No test attempts found.</div>
                    ) : (
                        <div className="space-y-6">
                            {testAttempts.map((attempt) => {
                                return (
                                    <div
                                        key={attempt._id}
                                        className="schedule-card bg-neutral-50 rounded-xl pt-4 pb-3 px-4 md:py-6 md:px-4 shadow-sm hover:shadow-md transition ease-in-out duration-100 border"
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
                                                        GATE Mock for {attempt.domainId}
                                                    </h2>
                                                    <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                                                        <p className="text-[#1d7dea] font-semibold text-sm bg-gray-50 rounded-full px-4 border border-gray-300">
                                                            {attempt.packId}
                                                        </p>
                                                        <p className="text-neutral-600 font-normal text-2xl hidden md:inline-block">•</p>
                                                        <p className="text-[#222222] font-semibold text-md flex items-center gap-2">
                                                            {attempt.testId}
                                                        </p>

                                                    </div>

                                                    <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                                                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                                        <p className="text-[#1d7dea] font-semibold text-md flex items-center gap-2">
                                                            Status:
                                                            {attempt.status === 'completed' ? <span className={`font-normal text-green-600`}>{attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}</span> : ''}
                                                            {attempt.status === 'attempting' ? <span className={`font-normal text-yellow-600`}>{attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}</span> : ''}
                                                            {/* <span className={`text-[#222222]`}>{attempt.status}</span> */}
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
                                                            <span className={`text-[#1d7dea] font-semibold`}>Start Time:</span> {new Date(attempt.startTime).toLocaleString()}
                                                        </p>
                                                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">•</p>
                                                        <p className="text-[#222222] font-normal text-md flex items-center gap-2">
                                                            <span className={`text-[#1d7dea] font-semibold`}>End Time:</span> {new Date(attempt.endTime).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className={`flex gap-2 mt-2 text-[#222222] text-sm font-normal`}>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center justify-center`}>
                                                <Link
                                                    className={`text-[#1d7dea] text-md hover:underline `}
                                                    href={`/dashboard/results/analysis/${attempt._id}?domain=${encodeURIComponent(attempt.domainId)}&pack=${encodeURIComponent(attempt.packId)}&test=${encodeURIComponent(attempt.testId)}`}
                                                >
                                                    View Result
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
