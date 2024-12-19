"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast, { Toaster } from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import style from '@/components/styles/dashboardCSS.module.css';
import Loader from "@/components/Loader";
import Link from "next/link";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import store from '@/libs/store';
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const getBranchName = (branch) => {
    switch (branch) {
        case "ECE":
            return "Electronics and Communication Engineering - ECE";
        case "Aerospace":
            return "Aerospace Engineering";
        case "Mechanical":
            return "Mechanical Engineering";
        default:
            return branch;
    }
};



export default function Dashboard() {
    const [userDetails, setUserDetails] = useState(null);
    const router = useRouter();
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [currOption, setCurrOption] = useState('account');

    const [name, setName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [collegeName, setCollegeName] = useState("");
    const [selectedBranch, setSelectedBranch] = useState('');
    const [uid, setUid] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [category, setCategory] = useState(null);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [otherBranch, setOtherBranch] = useState('');
    const [registeredTests, setRegisteredTests] = useState(null);


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
                setName(resjson.user.name);
                setCollegeName(resjson.user.college);
                setMobileNumber(resjson.user.mobile);
                setSelectedBranch(resjson.user.branch);
                setRegisteredTests(resjson.user.registeredTests);
            } else {
                toast.error("Failed to get user details.")
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };



    const addFAQ = async () => {
        // Show loading toast
        const loadingToastId = toast.loading("Creating FAQ...");

        try {
            const response = await fetch("/api/faqs/createFAQ", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question,
                    answer,
                    category,
                    createdByEmail: userDetails.email,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Show success toast
                toast.success("FAQ created successfully!", {
                    id: loadingToastId, // Replace loading toast with success
                });
                setAnswer('');
                setQuestion('');
                setCategory(null);
                return data; // Optionally return data if needed
            } else {
                // Show error toast
                toast.error("Failed to create FAQ: " + response.statusText, {
                    id: loadingToastId, // Replace loading toast with error
                });
                console.error("Failed to create FAQ:", response.statusText);
            }
        } catch (error) {
            // Show error toast
            toast.error("Error in addFAQ function: " + error.message, {
                id: loadingToastId, // Replace loading toast with error
            });
            console.error("Error in addFAQ function:", error);
        }
    }



    const updateuserInfo = async () => {
        const k = toast.loading("Updating info, please wait");
        const postReqData = {
            uid: uid,
            name: name,
            mobile: mobileNumber,
            branch: selectedBranch === 'other' ? otherBranch : selectedBranch,
            college: collegeName
        }
        try {
            const res = await fetch("/api/updateUserInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postReqData),
            });
            const resjson = await res.json();
            if (res.status === 200) {
                toast.dismiss(k);
                toast.success("Details updated.")
                setCurrOption('account');
            } else if (res.status === 201) {
                toast.dismiss(k);
                toast.error("Could not update, please try again.");
            } else {
                toast.error("Something went wrong.")
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }


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
        if (isFirstLoad) {
            // do nothing
        }
        else if (!isFirstLoad) {
            getUser(user.uid);
        }

    }, [currOption]);

    const handleBranchChange = (e) => {
        setSelectedBranch(e.target.value);
    };



    function AccountSection() {
        return (
            <div className={`bg-white font-bold rounded-2xl shadow-lg  border border-black ${style.fonttAverta}`}>
                <LoadAuth />
                <div className={`bg-[#1E91D6] rounded-t-2xl pt-5 pb-4 px-4`}>
                    <div className={`flex gap-2 md:px-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                        <h1 className="text-2xl font-semibold text-white">Account Information</h1>
                    </div>
                </div>
                {userDetails ?
                    <div>
                        <div className={`md:py-4 py-6 px-6`}>
                            <div className={`flex justify-center items-center my-0 md:my-10`}>
                                <div className="w-full grid grid-cols-1 lg:grid-cols-2 justify-center items-center gap-6 lg:gap-8 lg:mx-8">
                                    {/* Profile Card */}
                                    <div className="flex flex-col justify-center items-center border border-gray-300 bg-gray-50 rounded-xl shadow-md p-5 lg:p-6 h-full w-full">
                                        <img
                                            className="w-24 h-24 shadow-lg rounded-full border-[3px] border-[#0072bb] object-cover"
                                            src="/images/profile.png"
                                            alt="Profile picture"
                                        />
                                        <div className="text-center mt-4 space-y-1">
                                            <p className={`text-2xl font-semibold text-gray-800`}>{userDetails.name}</p>
                                            <p className="text-md text-gray-600">{userDetails.email}</p>
                                            <p className="text-md text-gray-600">+91 {userDetails.mobile}</p>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex flex-col gap-6 p-5 lg:p-10 h-full w-full bg-white border border-gray-200 rounded-lg shadow-md">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <span className="text-lg font-semibold text-[#0056a3]">Branch</span>
                                            <p className="text-base text-gray-800">{getBranchName(userDetails.branch)}</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <span className="text-lg font-semibold text-[#0056a3]">College</span>
                                            <p className="text-base text-gray-800">{userDetails.college}</p>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className={`bg-[#1E91D6] px-4 flex items-center h-8 rounded-b-2xl`}>
                            <p className={`${style.fonttAverta} text-white text-sm`}>To update your info, <button onClick={() => { setCurrOption('settings'); }} className={`bg-none underline`}>Click Here.</button></p>

                        </div>
                    </div>
                    :
                    <div className={`md:py-4 py-6 px-6`}>
                        <div className={`grid justify-center items-center my-0 md:my-10`}>
                            <div className={``}><Loader /></div>

                        </div>
                    </div>}

            </div>)
    }

    function Registrations() {

        return (

            <div className={`bg-white font-bold flex flex-col justify-between rounded-2xl shadow-lg  border border-black ${style.fonttAverta}`}>
                <LoadAuth />
                <div className={`bg-[#1E91D6] rounded-t-2xl pt-5 pb-4 px-4`}>
                    <div className={`flex gap-2 md:px-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-200-60q25 0 42.5-17.5T420-420q0-25-17.5-42.5T360-480q-25 0-42.5 17.5T300-420q0 25 17.5 42.5T360-360Zm200-60h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z" /></svg>
                        <h1 className="text-2xl font-semibold text-white">Registrations</h1>
                    </div>
                </div>
                {userDetails ?
                    <div>
                        {registeredTests.length == 0 &&
                            <div className={`md:py-4 py-6 px-6`}>
                                <div className={`grid lg:flex justify-center items-center md:my-10 w-full mx-auto`}>
                                    <div className={`flex flex-col justify-center items-center`}>
                                        <div className="flex flex-col p-6 gap-2 w-full rounded-2xl bg-white border border-gray-400 shadow-lg items-center max-w-sm mx-auto">
                                            <div className={`text-center`}>
                                                <p className={`${style.fonttAverta} text-sm font-bold`}>
                                                    You do not have any registrations.
                                                </p>
                                                <p className={`${style.fonttAverta} text-sm font-bold pt-1`}>
                                                    Please <Link className={`text-[#1e91d6] hover:underline`} href={'tests'}>register</Link> for the test
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {registeredTests &&
                            registeredTests.map((registration, index) => (
                                <div key={registration._id} className={`flex-col lg:flex lg:flex-wrap mx-4 md:mx-10 mt-8 mb-2`}>
                                    <div className="flex-col justify-center items-center bg-white border border-gray-400 shadow-lg rounded-xl p-5 lg:p-6 h-full w-full mb-4">
                                        <div className="text-left space-y-4 w-full">
                                            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-black">
                                                GATE Mock for {registration.test
                                                    ? registration.test.split(',')[0].includes('Electronics and Communication Engineering')
                                                        ? 'Electronics and Communication Engineering' // Replace with 'ECE' if the name includes Electronics and Communication Engineering
                                                        : registration.test.split(',')[0]
                                                    : "Test Name Not Available"}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8">
                                                <div className={`space-y-2`}>
                                                    <p className="text-md text-gray-600">
                                                        <strong className={`text-[#4d2deb]`}>Package:</strong> {registration.test ? registration.test.split(',')[1] : "Package Not Available"}
                                                    </p>
                                                    <p className="text-md text-gray-600">
                                                        <strong className={`text-[#4d2deb]`}>Name:</strong> {registration.userId.name}
                                                    </p>
                                                    <p className="text-md text-gray-600">
                                                        <strong className={`text-[#4d2deb]`}>Email:</strong> {registration.userId.email}
                                                    </p>
                                                </div>
                                                <div className={`space-y-2`}>
                                                    <p className="text-md text-gray-600 flex gap-1">
                                                        <strong className={`text-[#4d2deb]`}>Payment Status: </strong> <strong>{registration.payment.status === 'paid' && 'Paid'}</strong> <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#008000"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                                                    </p>
                                                    <p className="text-md text-gray-600">
                                                        <strong className={`text-[#4d2deb]`}>Amount:</strong> Rs. {registration.payment.amount} /-
                                                    </p>
                                                    <p className="text-md text-gray-600">
                                                        <strong className={`text-[#4d2deb]`}>PID:</strong> {registration.pid}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))
                        }

                        <div className={`bg-[#1E91D6] px-4 flex items-center h-8 rounded-b-2xl`}>
                            <p className={`${style.fonttAverta} text-white text-sm`}>Facing issues?, Please <Link href={'/contact-us'} className={`bg-none underline`}>Contact us.</Link></p>
                        </div>
                    </div> :
                    <div className={`md:py-4 py-6 px-6`}>
                        <div className={`grid justify-center items-center my-0 md:my-10`}>
                            <div className={``}><Loader /></div>
                        </div>
                    </div>
                }

            </div>)
    }

    function ResultSection() {
        return (
            <div className={`bg-white font-bold rounded-2xl shadow-lg  border border-black ${style.fonttAverta}`}>
                <LoadAuth />
                <div className={`bg-[#1E91D6] rounded-t-2xl pt-5 pb-4 px-4`}>
                    <div className={`flex gap-2 md:px-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff"><path d="M320-480v-80h320v80H320Zm0-160v-80h320v80H320Zm-80 240h300q29 0 54 12.5t42 35.5l84 110v-558H240v400Zm0 240h442L573-303q-6-8-14.5-12.5T540-320H240v160Zm480 80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80Zm-480-80v-640 640Zm0-160v-80 80Z" /></svg>
                        <h1 className="text-2xl font-semibold text-white">Results</h1>
                    </div>
                </div>
                {userDetails ?
                    <div>
                        <div className={`md:py-4 py-6 px-6`}>
                            <div className={`grid justify-center items-center md:my-10`}>
                                <div className={`flex flex-col justify-center items-center`}>
                                    <div className="flex flex-col p-6 gap-2 w-full rounded-2xl bg-white border border-gray-400 shadow-lg items-center max-w-sm mx-auto">
                                        <div className={`text-center`}>
                                            <p className={`${style.fonttAverta} text-sm font-bold`}>
                                                Nothing to show here for now.

                                            </p>

                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>
                        <div className={`bg-[#1E91D6] px-4 flex items-center h-8 rounded-b-2xl`}>
                            <p className={`${style.fonttAverta} text-white text-sm`}>Facing issues?, Please <Link href={'/contact-us'} className={`bg-none underline`}>Contact us.</Link></p>

                        </div>
                    </div> :
                    <div className={`md:py-4 py-6 px-6`}>
                        <div className={`grid justify-center items-center my-0 md:my-10`}>
                            <div className={``}><Loader /></div>
                        </div>
                    </div>}
            </div>)
    }


    return (
        <div>
            <div className={`topSection min-h-screen pb-20`}>
                <Navbar />
                <LoadAuth />
                <motion.div
                    className="flex justify-center p-5 md:px-20 md:py-6 lg:p-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    {/* Main Grid Container */}
                    <div className="mt-2 md:mt-8 lg:mt-16 flex flex-col lg:flex-row gap-8 lg:gap-6 w-full max-w-5xl lg:max-w-7xl">

                        <div className={`lg:w-3/12 `}>
                            {/* Floating Navigation Panel */}
                            <div className={`px-5`}>
                                <div className="hidden lg:flex bg-white border-[#0072bb] border-2 text-white rounded-xl shadow-2xl md:sticky top-10 self-start flex-col justify-between">
                                    <div>
                                        <div className={`rounded-xl hover:cursor-pointer mt-6 mx-3 flex px-2 pt-3 pb-2 items-center bg-[#1E91D6] py-3`}>
                                            <h2 className={`text-2xl flex gap-2 pl-1 font-bold text-white ${style.fonttAverta}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`mt-[2.5px]`} height="26px" viewBox="0 -960 960 960" width="26px" fill="#ffffff"><path d="m226-559 78 33q14-28 29-54t33-52l-56-11-84 84Zm142 83 114 113q42-16 90-49t90-75q70-70 109.5-155.5T806-800q-72-5-158 34.5T492-656q-42 42-75 90t-49 90Zm178-65q-23-23-23-56.5t23-56.5q23-23 57-23t57 23q23 23 23 56.5T660-541q-23 23-57 23t-57-23Zm19 321 84-84-11-56q-26 18-52 32.5T532-299l33 79Zm313-653q19 121-23.5 235.5T708-419l20 99q4 20-2 39t-20 33L538-80l-84-197-171-171-197-84 167-168q14-14 33.5-20t39.5-2l99 20q104-104 218-147t235-24ZM157-321q35-35 85.5-35.5T328-322q35 35 34.5 85.5T327-151q-25 25-83.5 43T82-76q14-103 32-161.5t43-83.5Zm57 56q-10 10-20 36.5T180-175q27-4 53.5-13.5T270-208q12-12 13-29t-11-29q-12-12-29-11.5T214-265Z" /></svg><span className={``}>Dashboard</span></h2>
                                        </div>
                                        <div className={`px-5 pb-5 pt-5`}>
                                            <nav>
                                                <ul className="space-y-4 flex flex-col justify-center">
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setCurrOption('account');
                                                            }}
                                                            className={`${currOption === "account" ? "bg-[#e9eef2]" : ""} hover:bg-[#e9eef2] w-full flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold px-3 py-2 block rounded-lg`}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                                            Profile</button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setCurrOption('registrations');
                                                            }}
                                                            className={`${currOption === "registrations" ? "bg-[#e9eef2]" : ""} hover:bg-[#e9eef2] w-full flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold px-3 py-2 block rounded-lg`}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-200-60q25 0 42.5-17.5T420-420q0-25-17.5-42.5T360-480q-25 0-42.5 17.5T300-420q0 25 17.5 42.5T360-360Zm200-60h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z" /></svg>
                                                            Registrations</button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setCurrOption('results');
                                                            }}
                                                            className={`${currOption === "results" ? "bg-[#e9eef2]" : ""} hover:bg-[#e9eef2] w-full flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold px-3 py-2 block rounded-lg`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M320-480v-80h320v80H320Zm0-160v-80h320v80H320Zm-80 240h300q29 0 54 12.5t42 35.5l84 110v-558H240v400Zm0 240h442L573-303q-6-8-14.5-12.5T540-320H240v160Zm480 80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80Zm-480-80v-640 640Zm0-160v-80 80Z" /></svg>
                                                            Results</button>
                                                    </li>
                                                    {userRole === "testAdmin" &&
                                                        <li>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrOption('addFaq');
                                                                }}
                                                                className={`${currOption === "addFaq" ? "bg-[#e9eef2]" : ""} hover:bg-[#e9eef2] w-full flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold px-3 py-2 block rounded-lg`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" /></svg>
                                                                Add FAQs</button>
                                                        </li>
                                                    }
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setCurrOption('settings');
                                                            }}
                                                            className={`${currOption === "settings" ? "bg-[#e9eef2]" : ""} hover:bg-[#e9eef2] w-full flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold px-3 py-2 block rounded-lg`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" /></svg>
                                                            Update Profile</button>
                                                    </li>

                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                    <div className={`px-5 pt-20 pb-4`}>
                                        <button
                                            onClick={() => {
                                                signOut(auth);
                                                window.location.href = "/sign-in";
                                            }} className={`hover:bg-[#e9eef2] flex gap-2 ${style.fonttAverta} text-[#3c4852] font-semibold w-full text-left px-3 py-2 block rounded-lg`}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
                                            Logout</button>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Navigation Panel for mobile screens */}
                            <div className="flex bg-white border-[#0072bb] border-2 text-white rounded-xl shadow-2xl flex-row items-center justify-evenly p-2 lg:hidden">
                                <nav className="flex flex-wrap gap-2 justify-center items-center">
                                    <button
                                        onClick={() => setCurrOption('account')}
                                        className={`text-sm sm:text-md flex items-center gap-2 text-[#3c4852] font-semibold p-2 rounded-lg ${currOption === 'account' ? 'bg-[#e9eef2]' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#3c4852"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setCurrOption('registrations')}
                                        className={`text-sm sm:text-md flex items-center gap-2 text-[#3c4852] font-semibold p-2 rounded-lg ${currOption === 'registrations' ? 'bg-[#e9eef2]' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#3c4852"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-200-60q25 0 42.5-17.5T420-420q0-25-17.5-42.5T360-480q-25 0-42.5 17.5T300-420q0 25 17.5 42.5T360-360Zm200-60h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z" /></svg>
                                        Registrations
                                    </button>
                                    <button
                                        onClick={() => setCurrOption('results')}
                                        className={`text-sm sm:text-md flex items-center gap-2 text-[#3c4852] font-semibold p-2 rounded-lg ${currOption === 'results' ? 'bg-[#e9eef2]' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#3c4852"><path d="M320-480v-80h320v80H320Zm0-160v-80h320v80H320Zm-80 240h300q29 0 54 12.5t42 35.5l84 110v-558H240v400Zm0 240h442L573-303q-6-8-14.5-12.5T540-320H240v160Zm480 80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80Zm-480-80v-640 640Zm0-160v-80 80Z" /></svg>
                                        Results
                                    </button>
                                    {userRole === "testAdmin" &&

                                        <button
                                            onClick={() => {
                                                setCurrOption('addFaq');
                                            }}
                                            className={`text-sm sm:text-md flex items-center gap-2 text-[#3c4852] font-semibold p-2 rounded-lg ${currOption === 'addFaq' ? 'bg-[#e9eef2]' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3c4852"><path d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" /></svg>
                                            Add FAQs</button>

                                    }
                                    <button
                                        onClick={() => setCurrOption('settings')}
                                        className={`text-sm sm:text-md flex items-center gap-2 text-[#3c4852] font-semibold p-2 rounded-lg ${currOption === 'settings' ? 'bg-[#e9eef2]' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#3c4852"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" /></svg>
                                        Settings
                                    </button>
                                </nav>
                            </div>
                        </div>

                        <div
                            className={`w-full lg:w-9/12 lg:pr-5`}

                        >
                            {currOption === 'account' &&
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}>
                                    <AccountSection />
                                </motion.div>

                            }
                            {currOption === 'registrations' &&
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}>
                                    <Registrations />
                                </motion.div>

                            }
                            {currOption === 'results' &&
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}>
                                    <ResultSection />
                                </motion.div>

                            }
                            {currOption === 'addFaq' &&
                                <motion.div className={`bg-white font-bold rounded-2xl shadow-lg  border border-black ${style.fonttAverta}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <LoadAuth />
                                    <div className={`bg-[#1E91D6] rounded-t-2xl pt-5 pb-4 px-4`}>
                                        <div className={`flex gap-2 md:px-2`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff"><path d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" /></svg>
                                            <h1 className="text-2xl font-semibold text-white">Add FAQ</h1>
                                        </div>
                                    </div>
                                    {userDetails ?
                                        <div>
                                            <div className={``}>
                                                <div className={``}>
                                                    <div className={`flex flex-col w-full justify-center items-center`}>
                                                        <div className="flex flex-col p-8 gap-2 w-full bg-white border border-gray-400 shadow-lg items-center mx-auto">
                                                            <div className={`w-full`}>
                                                                {/* Category Selection with Radio Buttons */}
                                                                <p className={`text-left w-full font-bold text-[#0072bb] ${style.fonttAverta} text-sm mb-1`}>Category</p>

                                                                <div className={`${style.radioButtonContainer} pt-2`}>
                                                                    <div className={`${style.radioButton}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            value="General"
                                                                            onChange={(e) => setCategory(e.target.value)}
                                                                            required
                                                                            className={`${style.radioButtonInput}`}
                                                                            id="radio1"
                                                                        />
                                                                        <label className={`${style.radioButtonLabel}`} htmlFor="radio1">
                                                                            <span className={`${style.radioButtonCustom}  ${style.fonttAverta}`}></span>
                                                                            General
                                                                        </label>
                                                                    </div>
                                                                    <div className={`${style.radioButton}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            value="Payments"
                                                                            onChange={(e) => setCategory(e.target.value)}
                                                                            required
                                                                            className={`${style.radioButtonInput}`}
                                                                            id="radio2"
                                                                        />
                                                                        <label className={`${style.radioButtonLabel}`} htmlFor="radio2">
                                                                            <span className={`${style.radioButtonCustom}  ${style.fonttAverta}`}></span>
                                                                            Payments
                                                                        </label>
                                                                    </div>
                                                                    <div className={`${style.radioButton}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            value="Technical"
                                                                            onChange={(e) => setCategory(e.target.value)}
                                                                            required
                                                                            className={`${style.radioButtonInput}`}
                                                                            id="radio3"
                                                                        />
                                                                        <label className={`${style.radioButtonLabel}`} htmlFor="radio3">
                                                                            <span className={`${style.radioButtonCustom}  ${style.fonttAverta}`}></span>
                                                                            Technical
                                                                        </label>
                                                                    </div>
                                                                    <div className={`${style.radioButton}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            value="Test"
                                                                            onChange={(e) => setCategory(e.target.value)}
                                                                            required
                                                                            className={`${style.radioButtonInput}`}
                                                                            id="radio4"
                                                                        />
                                                                        <label className={`${style.radioButtonLabel}`} htmlFor="radio4">
                                                                            <span className={`${style.radioButtonCustom}  ${style.fonttAverta}`}></span>
                                                                            Test
                                                                        </label>
                                                                    </div>
                                                                    <div className={`${style.radioButton}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            value="Other"
                                                                            onChange={(e) => setCategory(e.target.value)}
                                                                            required
                                                                            className={`${style.radioButtonInput}`}
                                                                            id="radio5"
                                                                        />
                                                                        <label className={`${style.radioButtonLabel}`} htmlFor="radio5">
                                                                            <span className={`${style.radioButtonCustom}  ${style.fonttAverta}`}></span>
                                                                            Other
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {/* Question Field */}
                                                                <p className={`text-left w-full font-bold text-[#0072bb] ${style.fonttAverta} text-sm mb-1`} htmlFor="question">Question</p>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={question}
                                                                    onChange={(e) => setQuestion(e.target.value)}
                                                                    className={` ${style.fonttAverta} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                    placeholder="Enter the FAQ question"
                                                                />

                                                                {/* Answer Field */}
                                                                <p className={`text-left font-bold text-[#0072bb] ${style.fonttAverta} text-sm mb-1`} htmlFor="answer">Answer</p>
                                                                <textarea
                                                                    required
                                                                    value={answer}
                                                                    onChange={(e) => setAnswer(e.target.value)}
                                                                    className={` ${style.fonttAverta} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                    placeholder="Enter the FAQ answer"
                                                                    rows="4"
                                                                ></textarea>
                                                            </div>

                                                            <button
                                                                className={`${style.button} flex gap-2 px-4`}
                                                                onClick={addFAQ}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" /></svg>
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className={`bg-[#1E91D6] px-4 flex items-center h-8 rounded-b-2xl`}>
                                                <p className={`${style.fonttAverta} text-white text-sm`}>Facing issues?, Please <Link href={'/contact-us'} className={`bg-none underline`}>Contact us.</Link></p>

                                            </div>
                                        </div> :
                                        <div className={`md:py-4 py-6 px-6`}>
                                            <div className={`grid justify-center items-center my-0 md:my-10`}>
                                                <div className={``}><Loader /></div>
                                            </div>
                                        </div>}


                                </motion.div>
                            }
                            {currOption === 'settings' &&
                                <motion.div className={`bg-white font-bold rounded-2xl shadow-lg  border border-black ${style.fonttAverta}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <LoadAuth />
                                    <div className={`bg-[#1E91D6] rounded-t-2xl pt-5 pb-4 px-4`}>
                                        <div className={`flex gap-2 md:px-2`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" /></svg>
                                            <h1 className="text-2xl font-semibold text-white">Account Settings</h1>
                                        </div>
                                    </div>
                                    {userDetails ?
                                        <div>
                                            <div className={`md:py-4 md:py-6 md:px-6`}>
                                                <div className={`md:grid md:justify-center md:items-center md:my-10`}>
                                                    <div className={`flex flex-col w-full justify-center items-center`}>
                                                        <div className="flex flex-col p-8 gap-2 w-full md:rounded-2xl bg-white border border-gray-400 shadow-lg items-center max-w-sm mx-auto">
                                                            <div className={``}>
                                                                <p className={`text-left  text-[#0072bb] text-sm mb-1`} htmlFor="name">Name</p>
                                                                <input onChange={(e) => setName(e.target.value)}
                                                                    type="name"
                                                                    required
                                                                    value={name}
                                                                    className={`${style.input} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                    placeholder="Full Name" />
                                                                <p className={`text-left  text-[#0072bb] text-sm mb-1 ${style.required}`} htmlFor="mobileNumber">Mobile Number</p>

                                                                <div className="flex mb-3 items-center gap-1">
                                                                    <span className="px-3 py-2.5 text-gray-700 border border-black rounded-l-md">+91</span>
                                                                    <input
                                                                        required
                                                                        onChange={(e) => setMobileNumber(e.target.value)}
                                                                        type="tel"
                                                                        value={mobileNumber}
                                                                        maxLength={10}
                                                                        className={`${style.input} w-full p-2.5 border-[1px] focus:border-blue-400 border-black rounded-r-md text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                        placeholder="XXXXXXXXXX"
                                                                    />
                                                                </div>
                                                                <p className={`text-left  text-[#0072bb] text-sm mb-1 ${style.required}`} htmlFor="branch">Branch</p>
                                                                <select required id="branches" value={selectedBranch} onChange={handleBranchChange}
                                                                    className={`${style.input} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}>
                                                                    <option className={`text-sm`} value="">Select Branch</option>
                                                                    <option className={`text-sm`} value="ECE">ECE</option>
                                                                    <option className={`text-sm`} value="Aerospace">Aerospace Engineering</option>
                                                                    <option className={`text-sm`} value="Mechanical">Mechanical Engineering</option>
                                                                    <option className={`text-sm`} value="Physics">Physics</option>
                                                                    <option className={`text-sm`} value="other">Other</option>
                                                                </select>
                                                                {selectedBranch === 'other' &&
                                                                    <div>
                                                                        <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="otherBranch">Enter your branch</p>
                                                                        <input onChange={(e) => setOtherBranch(e.target.value)}
                                                                            type="text"
                                                                            value={otherBranch}
                                                                            className={`${style.input} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                            placeholder="Branch" />
                                                                    </div>
                                                                }
                                                                <p className={`text-left  text-[#0072bb] text-sm mb-1 ${style.required}`} htmlFor="college">College</p>
                                                                <input onChange={(e) => setCollegeName(e.target.value)}
                                                                    required
                                                                    type="text"
                                                                    value={collegeName}
                                                                    className={`${style.input} w-full p-2.5 mb-3 border-[1px] focus:border-blue-400 border-black rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                                                                    placeholder="College Name" />
                                                            </div>
                                                            <button
                                                                className={`${style.button} flex gap-2 px-4`}
                                                                onClick={updateuserInfo}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" /></svg>
                                                                Save
                                                            </button>

                                                        </div>

                                                    </div>
                                                </div>

                                            </div>
                                            <div className={`bg-[#1E91D6] px-4 flex items-center h-8 rounded-b-2xl`}>
                                                <p className={`${style.fonttAverta} text-white text-sm`}>Facing issues?, Please <Link href={'/contact-us'} className={`bg-none underline`}>Contact us.</Link></p>

                                            </div>
                                        </div> :
                                        <div className={`md:py-4 py-6 px-6`}>
                                            <div className={`grid justify-center items-center my-0 md:my-10`}>
                                                <div className={``}><Loader /></div>
                                            </div>
                                        </div>}
                                </motion.div>
                            }
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}

