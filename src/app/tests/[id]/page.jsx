"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import Loader from "@/components/Loader";
import { useSelector } from 'react-redux';
import style from "@/components/styles/testsCSS.module.css"
import Link from "next/link";
import Image from "next/image";
import React from "react";
import tests from "@/data/tests";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/app/firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";


export default function TestDetails({ params }) {
  const [userDetails, setUserDetails] = useState(null);
  initializeApp(firebaseConfig);
  const auth = getAuth();
  const [user] = useAuthState(auth);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const pageParams = React.use(params);
  const [testDetails, setTestDetails] = useState(null);  // State to hold test details
  const [loadingPage, setLoadingPage] = useState(true);  // State to track loading state


  const pageType = pageParams.id;

  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState('Pack 1');



  const handlePackSelection = (pack) => {
    setSelectedPack(pack);
  };

  const handleProceedToEnrollment = () => {
    if (!selectedPack) {
      alert("Please select a package.");
      return;
    }
    // Navigate to enrollment page (Replace with actual navigation logic)
    window.location.href = `/enrollment?pack=${selectedPack}`;
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
      } else {
        toast.error("Failed to get user details.")
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    console.log(userDetails);

  }, [userDetails]);

  useEffect(() => {
    if (user) {
      getUser(user.uid);
      setIsFirstLoad(false);
    }
  }, [user]);

  // Filter data based on pageType
  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!pageType) return;  // Return if pageType is not available yet

      setLoadingPage(true);  // Set loading to true before the async operation

      // Simulate async operation (e.g., fetching or filtering the tests)
      const test = tests.find((test) => test.id === pageType);

      setTestDetails(test);  // Update state with the found test details
      setLoadingPage(false);  // Set loading to false once done
    };

    fetchTestDetails();  // Run the async function
  }, [pageType]);  // Dependency on pageType, rerun the effect when it changes

  function calculateDiscountedPrice(originalPrice, discount) {
    const discountRate = discount;
    const discountAmount = originalPrice * discountRate;
    const finalPrice = originalPrice - discountAmount;
    return Math.round(finalPrice);
  }



  if (loadingPage) {
    return (
      <div>
        <div className="min-h-screen topSection flex flex-col items-center w-full mx-auto pb-20">
          <Navbar />
          <div className={`grid grid-cols-1 items-center pt-8`}>
            <div className={`max-w-7xl mx-auto px-4 md:px-10 lg:px-10`}>
              <Loader />
            </div>
          </div>
        </div>
      </div>);
  }



  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center w-full mx-auto pb-20">

        <Navbar />
        <motion.div
          className={`w-full`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`w-full min-h-screen space-y-2`}>
            {testDetails &&
              <section className={`${style.topSection} w-full overflow-visible`}>
                <section className="sm:max-w-2xl md:max-w-4xl lg:max-w-screen-xl xl:max-w-screen-xl space-y-8 px-3 md:px-20 lg:px-5 mx-auto py-10">
                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8"
                    initial={{ opacity: 0, y: 10 }}    // Start below with opacity 0
                    animate={{ opacity: 1, y: 0 }}     // Fade in and move to original position
                    exit={{ opacity: 0, y: 10 }}       // Exit by fading out and moving down
                    transition={{ duration: 0.3 }}     // Duration of the animation
                  >
                    <div className={`flex flex-col justify-between col-span-1 lg:col-span-2 gap-5 md:gap-8`}>
                      {/* Page Title */}
                      <div className="text-sm flex flex-wrap gap-2 text-white">
                        <Link href="/">Home</Link> /
                        <Link href="/tests">GATE Mock Test</Link> /
                        <Link href={`/tests/${testDetails.id}`}>{testDetails.title}</Link>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-5xl font-extrabold text-white">
                          GATE Mock for {testDetails.title}
                        </h1>
                      </div>
                      {/* Test Details Box small screens*/}
                      <div className={`lg:hidden inline-block`}>
                        <div className="text-neutral-800 col-span-1 pt-8 pb-2 mx-auto relative overflow-hidden border border-neutral-500 rounded-xl bg-[#f1f7fe] px-6">
                          <div className="flex flex-col gap-8">
                            <div className="w-full flex justify-center items-center py-12 md:py-10 bg-white rounded-2xl">
                              <Image
                                src={testDetails.imageUrl}
                                width={150}
                                height={150}
                                alt={testDetails.title}
                              />
                            </div>
                            <div className="pb-4 md:pb-0 flex flex-col gap-6 justify-between pt-2 w-full">
                              <div className="flex flex-col gap-3">
                                <p className={`text-md text-green-700 font-semibold`}>Special Discount for limited time only*</p>
                                <div className={`flex items-center justify-between sm:justify-start sm:gap-10 pr-3`}>
                                  <div className={`flex items-center justify-center gap-4`}>
                                    <p className={`text-neutral-500 line-through font-hairline text-strike text-xl md:text-lg lg:text-2xl`}>
                                      {selectedPack === 'Pack 1' && `₹ ${testDetails.pricePerPack}`}{selectedPack === 'Pack 2' && `₹ ${testDetails.pricePerPack}`}
                                      {selectedPack === 'Both Packs' && `₹ ${testDetails.pricePerPack * 2}`}
                                    </p>
                                    <p className={`text-neutral-800 text-strike font-extrabold text-4xl md:text-3xl lg::text-5xl`}>
                                      {selectedPack === 'Pack 1' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate)}`}{selectedPack === 'Pack 2' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate)}`}
                                      {selectedPack === 'Both Packs' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack * 2, testDetails.discountRate)}`}
                                    </p>
                                  </div>
                                  <div className={`px-3 py-1 bg-green-100 border border-green-900 text-green-900 text-sm font-semibold rounded-full`}>
                                    {testDetails.discountRate * 100}% OFF
                                  </div>
                                </div>
                              </div>
                              <div className={`flex flex-col gap-4`}>
                                <p className="text-md font-semibold">Please choose your package:</p>
                                <div className="flex items-center gap-5">
                                  <button
                                    onClick={() => handlePackSelection('Pack 1')}
                                    className={`px-3 font-semibold text-sm md:text-md md:px-4 py-2 rounded-md ${selectedPack === 'Pack 1' ? 'bg-[#0072bb] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                  >
                                    Pack 1 <br /> (3 Tests)
                                  </button>
                                  <button
                                    onClick={() => handlePackSelection('Pack 2')}
                                    className={`px-3 font-semibold text-sm md:text-md md:px-4 py-2 rounded-md ${selectedPack === 'Pack 2' ? 'bg-[#0072bb] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                  >
                                    Pack 2 <br /> (3 Tests)
                                  </button>
                                  <button
                                    onClick={() => handlePackSelection('Both Packs')}
                                    className={`px-3 font-semibold text-sm md:text-md md:px-4 py-2 rounded-md ${selectedPack === 'Both Packs' ? 'bg-[#0072bb] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                  >
                                    Both Packs <br /> (6 Tests)
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-center">
                                <button
                                  className="px-8 w-full py-3 text-lg flex justify-center items-center font-extrabold rounded-xl text-center text-white bg-gradient-to-b from-[#1e91d6] to-[#0072bb] hover:bg-[#0072bb]"
                                  onClick={
                                    () => {
                                      if (userDetails) {
                                        router.push(`/tests/${testDetails.id}/enroll?${selectedPack}`);
                                      }
                                      else {
                                        toast.error('Please register/login first!');
                                        setTimeout(() => {
                                          router.push(`/sign-in`);
                                        }, 500);
                                      }
                                    }
                                  }
                                >
                                  Enroll Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Description Section */}
                      <div className="hidden lg:flex text-[15px] md:text-[18px] flex-col gap-4 text-white text-justify">
                        <p className={`text-white`}>
                          Special Discounted Price for Limited Time
                        </p>
                        <div className={`flex items-center w-full gap-5 pr-3`}>
                          <div className={`flex items-center justify-center gap-4`}>
                            <p className={`text-gray-200 line-through font-hairline text-strike text-2xl xl:text-2xl`}>
                              {selectedPack === 'Pack 1' && `₹ ${testDetails.pricePerPack}`}{selectedPack === 'Pack 2' && `₹ ${testDetails.pricePerPack}`}
                              {selectedPack === 'Both Packs' && `₹ ${testDetails.pricePerPack}`}
                            </p>
                            <p className={`text-white text-strike font-extrabold text-4xl xl:text-4xl`}>
                              ₹ {calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate)}
                            </p>
                          </div>
                          <p>
                            Per Package
                          </p>
                          <p className={`px-4 py-2 bg-white text-gray-900 text-md font-extrabold rounded-md`}>
                            {testDetails.discountRate * 100}% OFF
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {Object.entries(testDetails.testSchedule).map(([pack, schedule], index) => (
                          <div
                            key={`${testDetails.id}-${pack}`}
                            className="flex flex-col bg-[#f1f7fe] hover:shadow-md transition ease-in-out duration-200 border border-black rounded-xl px-6 py-6 lg:py-6 lg:px-10"
                          >
                            <div className="flex items-center gap-3 text-xl lg:text-2xl text-[#2c14a8] font-bold mb-4">
                              {/* SVG Icon */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="32px"
                                viewBox="0 -960 960 960"
                                width="32px"
                                fill="#2c14a8"
                                className="flex-shrink-0"
                              >
                                <path d="m400-570 80-40 80 40v-190H400v190ZM280-280v-80h200v80H280Zm-80 160q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-640v560-560Zm0 560h560v-560H640v320l-160-80-160 80v-320H200v560Z" />
                              </svg>

                              {/* Pack Name */}
                              <span className="whitespace-nowrap">{`Pack ${index + 1}`}</span>

                              {/* Gradient Line */}
                              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#2c14a8] via-red-400 to-[#ffffff]"></div>
                            </div>

                            <ul className="text-md lg:text-lg text-black space-y-3">
                              <li className="flex items-start">
                                <span className="font-bold">Includes 3 GATE Mock</span>
                              </li>
                              {Object.entries(schedule).map(([key, value], idx) => {
                                if (key.startsWith("test")) {
                                  return (
                                    <li key={idx} className="flex items-start gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#343434"
                                      >
                                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v200h-80v-40H200v400h280v80H200Zm0-560h560v-80H200v80Zm0 0v-80 80ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm300-263-37-37 37 37ZM620-140h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z" />
                                      </svg>
                                      <span>
                                        <span className="font-bold">{`Test ${idx + 1}:`}</span>
                                        <span className="text-neutral-700 ml-1">{value}</span>
                                      </span>
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Test Details Box Larger screens*/}
                    <div className={`hidden lg:inline-block`}>
                      <div className="text-neutral-800 col-span-1 pt-8 pb-6 mx-auto relative overflow-hidden border border-neutral-500 rounded-xl bg-[#f1f7fe] px-6">
                        <div className="flex flex-col gap-2">
                          <div className="w-full flex justify-center items-center py-12 md:py-10 bg-white rounded-2xl">
                            <Image
                              src={testDetails.imageUrl}
                              width={150}
                              height={150}
                              alt={testDetails.title}
                            />
                          </div>
                          <div className="pb-4 md:pb-0 flex flex-col gap-4 md:gap-3 justify-between pt-2 w-full">
                            <div className="flex flex-col gap-3">
                              <p className={`text-md text-green-700 font-semibold`}>Special Discount for limited time only*</p>
                              <div className={`flex items-center justify-between pr-3`}>
                                <div className={`flex items-center justify-center gap-4`}>
                                  <p className={`text-neutral-500 line-through font-hairline text-strike lg:text-lg xl:text-xl`}>
                                    {selectedPack === 'Pack 1' && `₹ ${testDetails.pricePerPack}`}{selectedPack === 'Pack 2' && `₹ ${testDetails.pricePerPack}`}
                                    {selectedPack === 'Both Packs' && `₹ ${testDetails.pricePerPack * 2}`}
                                  </p>
                                  <p className={`text-neutral-800 text-strike font-extrabold lg:text-3xl xl:text-4xl`}>
                                    {selectedPack === 'Pack 1' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate)}`}{selectedPack === 'Pack 2' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate)}`}
                                    {selectedPack === 'Both Packs' && `₹ ${calculateDiscountedPrice(testDetails.pricePerPack * 2, testDetails.discountRate)}`}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 bg-green-100 border border-green-900 text-green-900 text-sm font-semibold rounded-full`}>
                                  {testDetails.discountRate * 100}% OFF
                                </div>
                              </div>
                            </div>
                            <div className={`flex flex-col gap-2`}>
                              <p className="text-md font-semibold">Please choose a package:</p>
                              <div className="flex gap-5">
                                <button
                                  onClick={() => handlePackSelection('Pack 1')}
                                  className={`lg:px-2 xl:px-3 xl:text-md lg:text-sm font-semibold py-2 rounded-md ${selectedPack === 'Pack 1' ? 'bg-[#1e91d6] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                >
                                  Pack 1 <br /> (3 Tests)
                                </button>
                                <button
                                  onClick={() => handlePackSelection('Pack 2')}
                                  className={`lg:px-2 xl:px-3 xl:text-md lg:text-sm font-semibold py-2 rounded-md ${selectedPack === 'Pack 2' ? 'bg-[#1e91d6] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                >
                                  Pack 2 <br /> (3 Tests)
                                </button>
                                <button
                                  onClick={() => handlePackSelection('Both Packs')}
                                  className={`lg:px-2 xl:px-3 xl:text-md lg:text-sm font-semibold py-2 rounded-md ${selectedPack === 'Both Packs' ? 'bg-[#1e91d6] border border-neutral-700 text-white' : 'bg-gray-200'}`}
                                >
                                  Both Packs <br /> (6 Tests)
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <button
                                className="px-8 w-full py-3 text-lg flex justify-center items-center font-extrabold rounded-xl text-center text-white bg-gradient-to-b from-[#1e91d6] to-[#0072bb] hover:bg-[#0072bb]"
                                onClick={
                                  () => {
                                    if (userDetails) {
                                      router.push(`/tests/${testDetails.id}/enroll?pack=${selectedPack}`);
                                    }
                                    else {
                                      toast.error('Please register/login first!');
                                      setTimeout(() => {
                                        router.push(`/sign-in`);
                                      }, 500);
                                    }
                                  }
                                }
                              >

                                Enroll Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </section>
              </section>
            }
            <section className={`sm:max-w-xl md:max-w-4xl lg:max-w-screen-xl xl:max-w-screen-xl space-y-8 md:px-0 px-3 md:px-8 lg:px-5 mx-auto py-10`}>



              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl text-[#2c14a8] font-bold mb-6 text-center lg:text-left">
                  Why Choose Our Test Series?
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    {[
                      "Thorough preparation with a wide variety of questions.",
                      "Simulated real GATE experience with time constraints.",
                      "Detailed performance analysis for each test.",
                      "Access to top-notch mentors and doubt clarification sessions.",
                      "Boost your problem-solving skills and time management.",
                      "Updated content aligned with the latest GATE syllabus.",
                      "Opportunity to benchmark against thousands of aspirants.",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {/* Spark Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="28px"
                          width="28px"
                          viewBox="0 0 100 100"
                          fill="#FFB258"
                        >
                          <path d="M85.998,50C68.02,50,50.042,32.042,50,14.063V14c0,0.01-0.001,0.021-0.001,0.031c0-0.011-0.001-0.021-0.001-0.032v0.063  
  C49.956,32.042,31.979,50,14,50c18,0,36,18,36,36l0,0c0-18,18-36,36-36H85.998z" />
                        </svg>                        <span className="text-lg lg:text-xl text-gray-800 font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-4">
                    {[
                      "Learn from in-depth solutions provided for every test.",
                      "Identify weak areas with targeted improvement strategies.",
                      "Experience an engaging and user-friendly test interface.",
                      "Gain confidence with comprehensive test coverage.",
                      "Unlock advanced tips and tricks for solving complex problems.",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {/* Spark Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="28px"
                          width="28px"
                          viewBox="0 0 100 100"
                          fill="#FFB258"
                        >
                          <path d="M85.998,50C68.02,50,50.042,32.042,50,14.063V14c0,0.01-0.001,0.021-0.001,0.031c0-0.011-0.001-0.021-0.001-0.032v0.063  
  C49.956,32.042,31.979,50,14,50c18,0,36,18,36,36l0,0c0-18,18-36,36-36H85.998z" />
                        </svg>


                        <span className="text-lg lg:text-xl text-gray-800 font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </section>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
