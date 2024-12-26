"use client"
import NavbarTestPage from "@/components/NavbarTestPage.jsx";
import Footer from "@/components/Footer";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast, { Toaster } from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import style from '@/components/styles/dashboardCSS.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Link from "next/link";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import store from '@/libs/store';
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import tests from "@/data/tests";

export default function RegisteredTests() {
    const [userDetails, setUserDetails] = useState(null);
    const router = useRouter();
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [uid, setUid] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);


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

    console.log(userDetails);


    const handleAttemptTest = (testId) => {
        console.log("Attempting test:", testId);
        // Add logic to navigate to the test page
    };

    const renderTestDetails = () => {
        return userDetails.registeredTests.map((registeredTest) => {
            const [title, pack] = registeredTest.test.split(", ");
            const testData = tests.find((test) => test.title === title);

            if (!testData) return null;

            // Sanitize `packKey` by removing special characters and converting to lowercase
            const packKey = pack
                .toLowerCase()
                .replace(/\s+/g, "") // Remove spaces
                .replace(/[^a-z0-9]/g, ""); // Remove non-alphanumeric characters

            const schedule = testData.testSchedule[packKey];

            // Handle cases where `schedule` is undefined or null
            if (!schedule) {
                return (
                    <div
                        key={registeredTest._id}
                        className="card-container bg-white"
                    >
                        <div className="flex flex-col gap-3 items-start bg-white pt-6 md:px-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex gap-3">
                                <div className="h-full">
                                    <img
                                        src="/images/assignTestIcons.svg"
                                        alt="Assign Test Icon"
                                        className="w-12 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <h2 className="text-xl font-normal text-gray-800">GATE Mock for {title}</h2>
                                    <p className="text-[#666666] font-normal text-sm bg-gray-50 rounded-full px-4 border border-gray-300">
                                        {pack}
                                    </p>
                                </div>
                            </div>
                            <p className="text-red-500">No schedule found for this test.</p>
                        </div>
                    </div>

                );
            }

            return (
                <div
                    key={registeredTest._id}
                    className="card-container bg-white border-b border-gray-300"
                >
                    <div className="flex flex-col gap-3 items-start bg-white pt-6 pb-6 md:px-4 rounded-lg">
                        <div className="flex gap-3 flex-wrap">
                            <div className="h-full">
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <h2 className="text-xl font-normal text-gray-800">GATE Mock for {title}</h2>
                                <div className="flex items-center gap-2">
                                    <p className="text-[#666666] font-normal text-sm bg-gray-50 rounded-full px-4 border border-gray-300">
                                        {pack}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 w-full">
                            {Object.entries(schedule).map(([test, date]) => (
                                <div
                                    key={test}
                                    className="schedule-card bg-neutral-50 rounded-md pt-4 pb-3 px-4 md:p-4 shadow-sm hover:shadow-md transition ease-in-out duration-100 border"
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
                                                <h2 className="text-xl font-normal text-gray-800">
                                                    {title} - Mock {test.replace(/(\d+)/, " $1").replace(/^\w/, (c) => c.toUpperCase())}
                                                </h2>
                                                <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                                                    <p className="text-[#666666] font-normal text-md">{date}</p>
                                                    <p className="text-neutral-300 font-normal text-2xl hidden md:inline-block">•</p>
                                                    <p className="text-[#666666] font-normal text-md flex items-center gap-2">
                                                        <img src="/images/clockicon.svg" alt="" />
                                                        180 MIN
                                                    </p>
                                                    <p className="text-neutral-300 font-normal text-2xl hidden md:inline-block">•</p>
                                                    <p className="text-[#666666] font-normal text-md flex items-center gap-2">
                                                        5:30 PM - 8:30 PM
                                                    </p>
                                                    <p className="text-neutral-300 font-normal text-2xl hidden md:inline-block">•</p>
                                                    <p className="text-[#666666] font-normal text-md flex items-center gap-2">
                                                        GATE Mock
                                                    </p>
                                                </div>
                                                <div className={`flex gap-2 mt-2 text-[#666666] text-sm font-normal`}>
                                                    Test Mode:
                                                    <p className={`rounded-sm border text-sm text-purple-500 border-neutral-300 px-2`}>
                                                        Online
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-center`}>
                                            <Link
                                                className={`text-[#1d7dea] text-md hover:underline `}
                                                href={`/registered-tests/attempt/${registeredTest._id}?domain=${encodeURIComponent(title)}&pack=${encodeURIComponent(pack)}&test=${encodeURIComponent(test)}`}
                                            >
                                                Test Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        });
    };




    if (userDetails) {
        return (
            <div className="bg-white min-h-screen bg-gray-100">
                <NavbarTestPage />
                <div className="max-w-7xl min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-6 mb-8 mx-auto px-4 md:px-8">
                    <div className="w-full h-full pt-8 px-4 md:px-10 bg-white font-semibold traking-wider rounded-lg shadow-xs border border-gray-300 mx-auto">
                        <div className={`w-full`}>
                            <h1 className={`text-2xl ${style.fonttAverta}`}>
                                Your Tests
                            </h1>
                        </div>
                        <div className={``}>
                            {renderTestDetails()}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
    else {
        return (
            <div className="bg-white min-h-screen bg-gray-100">
                <NavbarTestPage />
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




}
