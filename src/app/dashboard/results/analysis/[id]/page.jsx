"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import useScreenSize from "@/hooks/useMobile";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import style from "@/components/styles/resultsAnalysis.module.css";
import toast from "react-hot-toast";
import { firebaseConfig } from "@/app/firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  setUID,
  fetchUserDetails,
  clearAuth,
} from "@/libs/features/auth/authSlice";
import store from "@/libs/store";
import { onAuthStateChanged } from "firebase/auth";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register the required ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);


// Utility functions for handling expansion and collapsing
const useExpandable = (initialState = false) => {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  return { isExpanded, toggleExpand };
};


const ExpandableSection = ({ title, children }) => {
  const { isExpanded, toggleExpand } = useExpandable();

  var color = '';

  if (title === 'Correct Questions') {
    color = 'bg-green-100';
  }
  else if (title === 'Incorrect Questions') {
    color = 'bg-red-100'
  }
  else if (title === 'Unattempted Questions') {
    color = 'bg-orange-100'
  }
  else {
    color = 'bg-neutral-50'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${color} border p-4 rounded-md mb-4`}>
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#000000"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>
        </motion.div>
      </div>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={isExpanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { duration: 0.3 }, opacity: { duration: 0.2 } }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};



export default function ResultsAnalysis({ params }) {

  const isMobile = useScreenSize();

  const pageParams = React.use(params);

  const AttemptId = pageParams.id;

  const searchParams = useSearchParams();
  const testPack = searchParams.get("pack");
  const testNumber = searchParams.get("test");
  const domain = searchParams.get("domain");
  const [userDetails, setUserDetails] = useState(null);
  initializeApp(firebaseConfig);
  const auth = getAuth();
  const [user] = useAuthState(auth);
  const [testAttempt, setTestAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userObjectId, setUserObjectId] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
        toast.error("Failed to get user details.");
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
        setError("An error occurred while fetching details from server.");
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

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Restricted</h1>
          <p className="text-lg mt-4">Please use a tablet or PC to view your test report.</p>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="bg-white min-h-screen bg-gray-100">
        <Navbar />
        <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] container min-h-screen flex flex-col items-center mt-32 max-w-7xl lg:max-w-7xl mx-auto px-2">
          <div className="bg-white font-bold rounded-2xl shadow-lg border border-gray-300 p-6 md:py-10 md:px-20">
            <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 space-y-6">
              <div className={``}>
                <Loader />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
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

  if (testAttempt) {


    var pieData = {};
    var pieOptions = {};


    var pieDataAptitude = {};
    var pieOptionsAptitude = {};

    var pieDataSubject = {};
    var pieOptionsSubject = {};

    if (testAttempt.report) {
      const totalScore = testAttempt.report.score.positive + Math.abs(testAttempt.report.score.negative);
      const totalScoreAptitude = testAttempt.report.aptitude.score.positive + Math.abs(testAttempt.report.aptitude.score.negative);
      const totalScoreSubject = testAttempt.report.subject.score.positive + Math.abs(testAttempt.report.subject.score.negative);

      pieData = {
        labels: ["Positive Score", "Negative Score"],
        datasets: [
          {
            data: [
              testAttempt.report.score.positive,
              Math.abs(testAttempt.report.score.negative),
            ],
            backgroundColor: ["#3de13d", "#d91f1c"],
            hoverBackgroundColor: ["#21d421", "#d91f1c"],
            borderColor: ["#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 15, // Makes the segment pop out on hover
          },
        ],
      };

      pieOptions = {
        responsive: true,
        cutout: "65%", // Converts pie to a doughnut chart
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = tooltipItem.raw;
                const percentage = ((value / totalScore) * 100).toFixed(1);
                return `Score: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: "#333",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
          },
          legend: {
            position: "bottom",
            labels: {
              color: "#333",
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: "Score Distribution",
            color: "#333",
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
          },
        },
      };





      pieDataAptitude = {
        labels: ["Positive Score", "Negative Score"],
        datasets: [
          {
            data: [
              testAttempt.report.aptitude.score.positive,
              Math.abs(testAttempt.report.aptitude.score.negative),
            ],
            backgroundColor: ["#3de13d", "#d91f1c"],
            hoverBackgroundColor: ["#21d421", "#d91f1c"],
            borderColor: ["#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 15, // Makes the segment pop out on hover
          },
        ],
      };

      pieOptionsAptitude = {
        responsive: true,
        cutout: "65%", // Converts pie to a doughnut chart
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = tooltipItem.raw;
                const percentage = ((value / totalScoreAptitude) * 100).toFixed(1);
                return `Score: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: "#333",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
          },
          legend: {
            position: "bottom",
            labels: {
              color: "#333",
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: "Score Distribution",
            color: "#333",
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
          },
        },
      };


      pieDataSubject = {
        labels: ["Positive Score", "Negative Score"],
        datasets: [
          {
            data: [
              testAttempt.report.subject.score.positive,
              Math.abs(testAttempt.report.subject.score.negative),
            ],
            backgroundColor: ["#3de13d", "#d91f1c"],
            hoverBackgroundColor: ["#21d421", "#d91f1c"],
            borderColor: ["#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 15, // Makes the segment pop out on hover
          },
        ],
      };

      pieOptionsSubject = {
        responsive: true,
        cutout: "65%", // Converts pie to a doughnut chart
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = tooltipItem.raw;
                const percentage = ((value / totalScoreSubject) * 100).toFixed(1);
                return `Score: ${value} (${percentage}%)`;
              },
            },
            backgroundColor: "#333",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
          },
          legend: {
            position: "bottom",
            labels: {
              color: "#333",
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: "Score Distribution",
            color: "#333",
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
          },
        },
      };


    }


    return (
      <div className="topSection min-h-screen bg-gray-100">
        <Navbar />
        <div className="min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-150px)] xl:min-h-[calc(100vh-170px)] lg:max-w-7xl flex flex-col items-center mt-6 mb-8 mx-auto px-4 md:px-0">
          <div className="w-full min-h-screen pt-10 pb-6 px-4 md:px-10 bg-white font-semibold traking-wider rounded-md shadow-xs border border-gray-300 mx-auto">
            <div className="space-y-6 mt-2">
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
                    <div className="flex flex-col gap-2 md:gap-1">
                      <h2 className="text-xl font-semibold text-gray-800">
                        GATE Mock for {testAttempt.domainId}
                      </h2>
                      <div className="flex flex-row items-center items-center md:space-y-0 gap-2">
                        <p className="text-[#1d7dea] font-semibold text-sm bg-gray-50 rounded-full px-4 border border-gray-300">
                          {testAttempt.packId}
                        </p>
                        <p className="text-neutral-600 font-normal text-2xl">•</p>
                        <p className="text-[#222222] font-semibold text-md flex items-center gap-2">
                          {testAttempt.testId}
                        </p>
                      </div>
                      <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">
                          •
                        </p>
                        <p className="text-[#1d7dea] font-semibold text-md flex items-center gap-2">
                          Status:
                          {testAttempt.status === "completed" ? (
                            <span className={`font-normal text-green-600`}>
                              {testAttempt.status.charAt(0).toUpperCase() +
                                testAttempt.status.slice(1)}
                            </span>
                          ) : (
                            ""
                          )}
                          {testAttempt.status === "attempting" ? (
                            <span className={`font-normal text-orange-500`}>
                              {testAttempt.status.charAt(0).toUpperCase() +
                                testAttempt.status.slice(1)}
                            </span>
                          ) : (
                            ""
                          )}
                          {testAttempt.status === "evaluated" ? (
                            <span className={`font-normal text-green-600`}>
                              {testAttempt.status.charAt(0).toUpperCase() +
                                testAttempt.status.slice(1)}
                            </span>
                          ) : (
                            ""
                          )}
                        </p>
                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">
                          •
                        </p>
                        <p
                          className={`text-[#1d7dea] font-semibold text-md flex items-center gap-2`}
                        >
                          Test Mode:
                          <span
                            className={`rounded-sm border text-sm text-purple-500 border-neutral-300 px-2`}
                          >
                            Online
                          </span>
                        </p>
                      </div>
                      <div className="flex-col md:flex md:flex-row md:items-center items-center space-y-2 md:space-y-0 md:gap-2">
                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">
                          •
                        </p>
                        <p className="text-[#222222] font-normal text-md flex items-center gap-2">
                          <span className={`text-[#1d7dea] font-semibold`}>
                            Start Time:
                          </span>{" "}
                          {new Date(testAttempt.startTime).toLocaleString()}
                        </p>
                        <p className="text-[#1d7dea] font-normal text-2xl hidden md:inline-block">
                          •
                        </p>
                        <p className="text-[#222222] font-normal text-md flex items-center gap-2">
                          <span className={`text-[#1d7dea] font-semibold`}>
                            End Time:
                          </span>{" "}
                          {new Date(testAttempt.endTime).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`flex gap-2 mt-2 text-[#222222] text-sm font-normal`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {testAttempt.status != "evaluated" && (
              <div
                className={`w-full flex-col space-y-6 justify-center items-center mt-12 md:mt-20`}
              >
                <div className={`w-full flex items-center justify-center`}>
                  <div className={`${style.typewriter}`}>
                    <div className={style.slide}>
                      <i></i>
                    </div>
                    <div className={style.paper}></div>
                    <div className={style.keyboard}></div>
                  </div>
                </div>
                <div className={`text-sm md:text-md text-center`}>
                  Evaluation is done... Please refresh the page to check your report.
                </div>
              </div>
            )}


            {testAttempt.status === "evaluated" && (
              <div className="w-full flex flex-col space-y-8 mt-12 md:mt-2">
                <section className="flex justify-center items-center">
                  <motion.div
                    className="w-full grid grid-cols-1 sm:grid-cols-8 gap-6 bg-white px-6 py-8 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Cards container */}
                    <motion.div
                      className="col-span-5 grid grid-cols-1 px-10 sm:grid-cols-2 gap-8 items-start w-full text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {/* Title with gradient color */}
                      <motion.h2
                        className="text-5xl w-full col-span-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 my-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        Overall
                      </motion.h2>

                      {/* Cards */}
                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.score.positive}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Positive Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.score.negative}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Negative Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.accuracy}%
                        </p>
                        <p className="text-md text-gray-700 mt-2">Accuracy</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.score.total}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Score</p>
                      </div>



                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md col-span-2 flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.gateRank}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Expected GATE Rank</p>
                      </div>
                    </motion.div>

                    {/* Chart */}
                    <motion.div
                      className="col-span-3 w-full h-full flex justify-end items-end px-8"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pie data={pieData} options={pieOptions} />
                    </motion.div>
                  </motion.div>

                </section>



                <hr />

                {/* Aptitude Section */}

                <section className="flex justify-center items-center">
                  <motion.div
                    className="w-full grid grid-cols-1 sm:grid-cols-8 gap-6 bg-white px-6 py-4 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Cards container */}
                    <motion.div
                      className="col-span-5 grid grid-cols-1 px-10 sm:grid-cols-2 gap-8 items-start w-full text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {/* Title with gradient color */}
                      <motion.h2
                        className="text-5xl w-full col-span-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 my-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        Aptitude
                      </motion.h2>

                      {/* Cards */}
                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.aptitude.score.positive}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Positive Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.aptitude.score.negative}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Negative Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.aptitude.accuracy}%
                        </p>
                        <p className="text-md text-gray-700 mt-2">Accuracy</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.aptitude.score.total}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Score</p>
                      </div>

                    </motion.div>

                    {/* Chart */}
                    <motion.div
                      className="col-span-3 w-full h-full flex justify-end items-end px-8"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pie data={pieDataAptitude} options={pieOptionsAptitude} />
                    </motion.div>
                  </motion.div>

                </section>


                <div>
                  <div className="space-y-4">
                    <ExpandableSection title="Correct Questions">
                      {testAttempt.report.aptitude.correctedQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className=" p-4 rounded-md mb-4">
                            <p><strong>Question:</strong></p>
                            <p
                              dangerouslySetInnerHTML={renderLatex(item.question.questionText)}

                              className="bg-gray-100 p-4 rounded-md"
                            ></p>
                            {item.question.diagramLink ?
                              <img src={item.question.diagramLink} alt="Question Diagram" />
                              : ''
                            }
                            <p><strong>Correct Answer:</strong> {item.correctAnswer}</p>
                            <p><strong>Your Answer:</strong> {item.yourAnswer}</p>
                            <p><strong>Marks:</strong> {item.marks}</p>
                          </div>
                        </ExpandableSection>
                      ))}
                    </ExpandableSection>


                    <ExpandableSection title="Incorrect Questions">
                      {testAttempt.report.aptitude.incorrectQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className="p-6 bg-white shadow-md rounded-md mb-6 border border-gray-200">
                            {/* Question Section */}
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-gray-800 mb-2">Question:</p>
                              <p
                                className="bg-gray-100 text-gray-700 p-4 rounded-md"
                                dangerouslySetInnerHTML={renderLatex(item.question.questionText)}
                              ></p>
                              {item.question.diagramLink && (
                                <div className="mt-4">
                                  <img
                                    src={item.question.diagramLink}
                                    alt="Question Diagram"
                                    className="rounded-md border border-gray-300"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Options Section */}
                            {item.question.options && item.question.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-800 mb-2">Options:</p>
                                <div className="space-y-3">
                                  {item.question.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <p className="text-gray-800 font-medium"> {option.optionId}) <span dangerouslySetInnerHTML={renderLatex(option.optionText)}></span></p>
                                        {option.optionDiagram && (
                                          <img
                                            src={option.optionDiagram}
                                            alt={`Option ${option.optionId} Diagram`}
                                            className="mt-2 rounded-md border border-gray-300"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Answer and Marks Section */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                <strong>Correct Answer:</strong> {item.correctAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Your Answer:</strong> {item.yourAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Marks Obtained:</strong> {item.marks}
                              </p>
                            </div>
                          </div>

                        </ExpandableSection>
                      ))}
                    </ExpandableSection>



                    <ExpandableSection title="Unattempted Questions">
                      {testAttempt.report.aptitude.unattemptedQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className="p-6 bg-white shadow-md rounded-md mb-6 border border-gray-200">
                            {/* Question Section */}
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-gray-800 mb-2">Question:</p>
                              <p
                                className="bg-gray-100 text-gray-700 p-4 rounded-md"
                                dangerouslySetInnerHTML={renderLatex(item.question.questionText)}
                              ></p>
                              {item.question.diagramLink && (
                                <div className="mt-4">
                                  <img
                                    src={item.question.diagramLink}
                                    alt="Question Diagram"
                                    className="rounded-md border border-gray-300"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Options Section */}
                            {item.question.options && item.question.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-800 mb-2">Options:</p>
                                <div className="space-y-3">
                                  {item.question.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <p className="text-gray-800 font-medium"> {option.optionId}) <span dangerouslySetInnerHTML={renderLatex(option.optionText)}></span></p>
                                        {option.optionDiagram && (
                                          <img
                                            src={option.optionDiagram}
                                            alt={`Option ${option.optionId} Diagram`}
                                            className="mt-2 rounded-md border border-gray-300"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Answer and Marks Section */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                <strong>Correct Answer:</strong> {item.correctAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Your Answer:</strong> {item.yourAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Marks obtained:</strong> {item.marks}
                              </p>
                            </div>
                          </div>
                        </ExpandableSection>
                      ))}
                    </ExpandableSection>


                  </div>
                </div>

                <hr />




                {/* Subject Section */}


                <section className="flex justify-center items-center">
                  <motion.div
                    className="w-full grid grid-cols-1 sm:grid-cols-8 gap-6 bg-white px-6 py-4 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Cards container */}
                    <motion.div
                      className="col-span-5 grid grid-cols-1 px-10 sm:grid-cols-2 gap-8 items-start w-full text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {/* Title with gradient color */}
                      <motion.h2
                        className="text-5xl w-full col-span-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 my-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        Subject
                      </motion.h2>

                      {/* Cards */}
                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.subject.score.positive}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Positive Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.subject.score.negative}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Negative Score</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.subject.accuracy}%
                        </p>
                        <p className="text-md text-gray-700 mt-2">Accuracy</p>
                      </div>

                      <div className="w-full bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <p className="text-4xl font-bold text-blue-600">
                          {testAttempt.report.subject.score.total}
                        </p>
                        <p className="text-md text-gray-700 mt-2">Total Score</p>
                      </div>

                    </motion.div>

                    {/* Chart */}
                    <motion.div
                      className="col-span-3 w-full h-full flex justify-end items-end px-8"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pie data={pieDataSubject} options={pieOptionsSubject} />
                    </motion.div>
                  </motion.div>

                </section>


                <div>
                  <div className="space-y-4">
                    <ExpandableSection title="Correct Questions">
                      {testAttempt.report.subject.correctedQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className="p-6 bg-white shadow-md rounded-md mb-6 border border-gray-200">
                            {/* Question Section */}
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-gray-800 mb-2">Question:</p>
                              <p
                                className="bg-gray-100 text-gray-700 p-4 rounded-md"
                                dangerouslySetInnerHTML={renderLatex(item.question.questionText)}
                              ></p>
                              {item.question.diagramLink && (
                                <div className="mt-4">
                                  <img
                                    src={item.question.diagramLink}
                                    alt="Question Diagram"
                                    className="rounded-md border border-gray-300"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Options Section */}
                            {item.question.options && item.question.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-800 mb-2">Options:</p>
                                <div className="space-y-3">
                                  {item.question.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <p className="text-gray-800 font-medium"> {option.optionId}) <span dangerouslySetInnerHTML={renderLatex(option.optionText)}></span></p>
                                        {option.optionDiagram && (
                                          <img
                                            src={option.optionDiagram}
                                            alt={`Option ${option.optionId} Diagram`}
                                            className="mt-2 rounded-md border border-gray-300"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Answer and Marks Section */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                <strong>Correct Answer:</strong> {item.correctAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Your Answer:</strong> {item.yourAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Marks Obtained:</strong> {item.marks}
                              </p>
                            </div>
                          </div>
                        </ExpandableSection>
                      ))}
                    </ExpandableSection>





                    <ExpandableSection title="Incorrect Questions">
                      {testAttempt.report.subject.incorrectQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className="p-6 bg-white shadow-md rounded-md mb-6 border border-gray-200">
                            {/* Question Section */}
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-gray-800 mb-2">Question:</p>
                              <p
                                className="bg-gray-100 text-gray-700 p-4 rounded-md"
                                dangerouslySetInnerHTML={renderLatex(item.question.questionText)}
                              ></p>
                              {item.question.diagramLink && (
                                <div className="mt-4">
                                  <img
                                    src={item.question.diagramLink}
                                    alt="Question Diagram"
                                    className="rounded-md border border-gray-300"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Options Section */}
                            {item.question.options && item.question.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-800 mb-2">Options:</p>
                                <div className="space-y-3">
                                  {item.question.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <p className="text-gray-800 font-medium"> {option.optionId}) <span dangerouslySetInnerHTML={renderLatex(option.optionText)}></span></p>
                                        {option.optionDiagram && (
                                          <img
                                            src={option.optionDiagram}
                                            alt={`Option ${option.optionId} Diagram`}
                                            className="mt-2 rounded-md border border-gray-300"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Answer and Marks Section */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                <strong>Correct Answer:</strong> {item.correctAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Your Answer:</strong> {item.yourAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Marks Obtained:</strong> {item.marks}
                              </p>
                            </div>
                          </div>
                        </ExpandableSection>
                      ))}
                    </ExpandableSection>


                    <ExpandableSection title="Unattempted Questions">
                      {testAttempt.report.subject.unattemptedQuestions.map((item, index) => (
                        <ExpandableSection
                          key={index}
                          title={`Question ID: ${item.question.questionId}`}
                        >
                          <div className="p-6 bg-white shadow-md rounded-md mb-6 border border-gray-200">
                            {/* Question Section */}
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-gray-800 mb-2">Question:</p>
                              <p
                                className="bg-gray-100 text-gray-700 p-4 rounded-md"
                                dangerouslySetInnerHTML={renderLatex(item.question.questionText)}
                              ></p>
                              {item.question.diagramLink && (
                                <div className="mt-4">
                                  <img
                                    src={item.question.diagramLink}
                                    alt="Question Diagram"
                                    className="rounded-md border border-gray-300"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Options Section */}
                            {item.question.options && item.question.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-lg font-semibold text-gray-800 mb-2">Options:</p>
                                <div className="space-y-3">
                                  {item.question.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <p className="text-gray-800 font-medium"> {option.optionId}) <span dangerouslySetInnerHTML={renderLatex(option.optionText)}></span></p>
                                        {option.optionDiagram && (
                                          <img
                                            src={option.optionDiagram}
                                            alt={`Option ${option.optionId} Diagram`}
                                            className="mt-2 rounded-md border border-gray-300"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Answer and Marks Section */}
                            <div className="mt-4">
                              <p className="text-gray-800">
                                <strong>Correct Answer:</strong> {item.correctAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Your Answer:</strong> {item.yourAnswer}
                              </p>
                              <p className="text-gray-800">
                                <strong>Marks Obtained:</strong> {item.marks}
                              </p>
                            </div>
                          </div>
                        </ExpandableSection>
                      ))}
                    </ExpandableSection>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
        <Footer />
      </div>
    );
  }


}
