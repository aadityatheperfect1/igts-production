"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast, { Toaster } from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import axios from "axios";
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
import { IKImage, IKUpload, IKContext } from "imagekitio-react";




export default function Dashboard() {

    const [userDetails, setUserDetails] = useState(null);
    const router = useRouter();
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [uid, setUid] = useState('');
    const [diagramText, setDiagramText] = useState(false);


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

    // State to store form inputs
    const [formData, setFormData] = useState({
        questionId: "",
        domainId: "",
        packId: "",
        testId: "",
        section: "aptitude", // default value
        type: "MCQ_SINGLE", // default value
        questionText: "",
        diagramLink: "",
        options: [{ optionId: "a", optionText: "", optionImage: "" }], // default one option
        correctAnswers: [],
        marks: 1,
        negativeMarks: 0.00,
        difficulty: "medium", // default value
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle options change
    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    // Add a new option
    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { optionId: "", optionText: "", optionImage: "" }],
        });
    };

    // Remove an option
    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const authenticator = async () => {
        try {
            const response = await fetch("/api/generateUploadAuth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Authentication request failed");
            }

            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    // Submit form
    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation for required fields
        if (!formData.questionId || !formData.domainId || !formData.packId || !formData.testId || !formData.questionText) {
            setError("Please fill in all required fields.");
            toast.error("Please fill in all required fields.");
            return;
        }

        if (formData.type !== "NUMERICAL" && formData.options.length < 2) {
            setError("MCQ questions must have at least two options.");
            toast.error("MCQ questions must have at least two options.");
            return;
        }

        try {
            const k = toast.loading("Saving the question, Please wait!");
            // Send POST request to your API endpoint
            const response = await axios.post("/api/addQuestion", formData);
            setSuccess("Question added successfully!");
            toast.dismiss(k);
            toast.success("Question added successfully!");
            setFormData({
                questionId: "",
                domainId: "",
                packId: "",
                testId: "",
                section: "aptitude",
                type: "MCQ_SINGLE",
                questionText: "",
                diagramLink: "",
                options: [{ optionId: "a", optionText: "", optionImage: "" }],
                correctAnswers: [],
                marks: 1,
                negativeMarks: 0.00,
                difficulty: "medium",
                uploadedBy: userDetails.email,
            });
        } catch (err) {
            setError("Failed to add question. Please try again.");
            console.log(err);
            toast.error("Failed to add question. Please try again.");
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
            <div className={`topSection min-h-screen`}>
                <Navbar />
                <div className={`bg-white sm:max-w-3xl md:max-w-6xl xl:max-w-7xl min-h-screen xl:mx-auto m-2 sm:m-3 md:m-4 lg:m-8 xl:my-12 font-bold rounded-2xl overflow-hidden shadow-lg border border-black ${style.fonttAverta}`}>
                    <div className={`bg-[#1e91d6] w-full py-4`}>
                        <div className={`grid justify-center items-center`}>
                            <div className={``}>
                                <h1 className={`text-neutral-50 text-2xl md:text-3xl lg:text-3xl xl:text-3xl`}>
                                    Add Question
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-neutral-50 w-full py-4`}>
                        <div className={`grid justify-center items-center`}>
                            <div className="p-8 max-w-4xl mx-auto">

                                {error && <p className="text-red-600">{error}</p>}
                                {success && <p className="text-green-600">{success}</p>}

                                <form onSubmit={handleSubmit}>
                                    {/* Basic Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold mb-2">Question ID</label>
                                            <input
                                                type="text"
                                                name="questionId"
                                                placeholder="Enter Question ID"
                                                value={formData.questionId}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-2">Test</label>
                                            <select
                                                name="testId"
                                                value={formData.testId}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                                required
                                            >
                                                <option value="" disabled>
                                                    Select Test
                                                </option>
                                                <option value="Test 1">Test 1</option>
                                                <option value="Test 2">Test 2</option>
                                                <option value="Test 3">Test 3</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block font-semibold mb-2">Pack</label>
                                            <div className="flex flex-wrap gap-4">
                                                {["Pack 1", "Pack 2"].map((pack) => (
                                                    <label key={pack} className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name="packId"
                                                            value={pack}
                                                            onChange={handleInputChange}
                                                            checked={formData.packId === pack}
                                                            required
                                                        />
                                                        <span>{pack}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-2">Domain</label>
                                            <div className="flex flex-wrap gap-4">
                                                {["ECE", "Aerospace", "Mechanical", "Physics"].map((domain) => (
                                                    <label key={domain} className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            name="domainId"
                                                            value={domain}
                                                            onChange={handleInputChange}
                                                            checked={formData.domainId === domain}
                                                            required
                                                        />
                                                        <span>{domain}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="mt-4">
                                        <label className="block font-semibold mb-2">Question Text</label>
                                        <textarea
                                            name="questionText"
                                            placeholder="Enter Question Text"
                                            value={formData.questionText}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                            required
                                        />
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        <label className="block font-bold mb-2">Diagram Link (Optional)</label>
                                        <IKContext
                                            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                                            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                                            authenticator={authenticator}
                                        >
                                            <div className={"w-full flex flex-col"}>
                                                <span className={`text-green-600 mb-1`}>{diagramText ? "Uploaded ✓" : ""}</span>
                                                <IKUpload
                                                    folder="questionsData"
                                                    onChange={() => {
                                                        // Display a loading toast when the file is selected
                                                        toast.loading("Uploading, please wait");
                                                    }}
                                                    onError={() => {
                                                        toast.dismiss();
                                                        toast.error("Problem in uploading image");
                                                    }}
                                                    onSuccess={(res) => {
                                                        setDiagramText(true);
                                                        formData.diagramLink = res.url;
                                                        toast.dismiss();
                                                        toast.success("Uploaded!");
                                                    }}
                                                />
                                            </div>
                                        </IKContext>
                                        <input
                                            readOnly
                                            type="url"
                                            name="diagramLink"
                                            placeholder="Diagram Link"
                                            value={formData.diagramLink}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full text-neutral-700"
                                        />


                                    </div>

                                    <div className="mt-4">
                                        <label className="block font-semibold mb-2">Question Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                            required
                                        >
                                            <option value="MCQ_SINGLE">MCQ (Single Correct)</option>
                                            <option value="MCQ_MULTIPLE">MCQ (Multiple Correct)</option>
                                            <option value="NUMERICAL">Numerical Answer Type</option>
                                        </select>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block font-semibold mb-2">Section</label>
                                        <select
                                            name="section"
                                            value={formData.section}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                            required
                                        >
                                            <option value="aptitude">Aptitude</option>
                                            <option value="subject">Subject</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block font-semibold mb-2">Marks</label>
                                            <input
                                                type="number"
                                                name="marks"
                                                placeholder="Enter Marks"
                                                value={formData.marks}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-2">Negative Marks</label>
                                            <input
                                                type="float"
                                                name="negativeMarks"
                                                placeholder="Enter Negative Marks"
                                                value={formData.negativeMarks}
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block font-semibold mb-2">Difficulty</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                            required
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Options */}
                                    <div className="mt-4">
                                        <h2 className="text-xl font-semibold mb-2">Options</h2>
                                        {formData.options.map((option, index) => (
                                            <div key={index} className="grid grid-cols-4 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Option ID (e.g., a, b)`}
                                                    value={option.optionId}
                                                    onChange={(e) => handleOptionChange(index, "optionId", e.target.value)}
                                                    className="border p-2 col-span-1"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Option Text"
                                                    value={option.optionText}
                                                    onChange={(e) => handleOptionChange(index, "optionText", e.target.value)}
                                                    className="border p-2 col-span-3"
                                                    required
                                                />
                                                <IKContext
                                                    publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                                                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                                                    authenticator={authenticator}
                                                >
                                                    <div className="w-full flex flex-col col-span-4">
                                                        <IKUpload
                                                            folder="questionsData"
                                                            onChange={() => {
                                                                // Display a loading toast when the file is selected
                                                                toast.loading("Uploading, please wait");
                                                            }}
                                                            onError={() => {
                                                                toast.dismiss();
                                                                toast.error("Problem in uploading image");
                                                            }}
                                                            onSuccess={(res) => {
                                                                // Update the option object
                                                                option.optionImage = res.url;

                                                                // Dynamically update the input field value
                                                                document.getElementById(`option-image-${index}`).value = res.url;

                                                                // Trigger the state update to reflect changes in the UI
                                                                handleOptionChange(index, "optionImage", res.url);
                                                                toast.dismiss();
                                                                toast.success("Uploaded!");
                                                            }}
                                                        />
                                                    </div>
                                                </IKContext>
                                                <input
                                                    type="url"
                                                    readOnly
                                                    placeholder="Option Image Link (optional)"
                                                    value={option.optionImage}
                                                    onChange={(e) => handleOptionChange(index, "optionImage", e.target.value)}
                                                    className="border p-2 col-span-4 text-neutral-700"
                                                    id={`option-image-${index}`} // Add an ID to target the input field
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="text-red-600 hover:underline mt-2 text-left"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="text-[#1e91d6] hover:underline mt-2"
                                        >
                                            Add Option
                                        </button>
                                    </div>


                                    {/* Correct Answers */}
                                    <div className="mt-4">
                                        <label className="block font-semibold mb-2">Correct Answers</label>
                                        <input
                                            type="text"
                                            name="correctAnswers"
                                            placeholder="Correct Answers (e.g., a, c)"
                                            value={formData.correctAnswers.join(", ")}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    correctAnswers: e.target.value.split(",").map((ans) => ans.trim()),
                                                })
                                            }
                                            className="border p-2 w-full"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="bg-[#1e91d6] hover:bg-[#0072bb] transition ease-in-out duration-300 text-white px-4 py-2 mt-4 rounded"
                                    >
                                        Add Question
                                    </button>
                                </form>
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
                                You are <span className="text-red-500 font-semibold">NOT</span> allowed to add questions
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