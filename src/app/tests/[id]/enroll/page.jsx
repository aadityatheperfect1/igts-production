"use client"
import NavbarLite from "@/components/NavbarLite.jsx";
import Footer from "@/components/Footer.jsx";
import Loader from "@/components/Loader";
import { useSelector } from 'react-redux';
import style from "@/components/styles/testsCSS.module.css"
import Link from "next/link";
import Image from "next/image";
import React, { useLayoutEffect } from "react";
import tests from "@/data/tests";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from 'next/navigation'
import toast from "react-hot-toast";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "@/app/firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from "framer-motion";


export default function Enroll({ params }) {

  const [userDetails, setUserDetails] = useState(null);
  initializeApp(firebaseConfig);
  const auth = getAuth();
  const [user] = useAuthState(auth);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const searchParams = useSearchParams();
  const testPack = searchParams.get('pack'); // Retrieve the 'pack' query parameter

  const pageParams = React.use(params);
  const [testDetails, setTestDetails] = useState(null);  // State to hold test details
  const [loadingPage, setLoadingPage] = useState(true);  // State to track loading state


  const pageType = pageParams.id;

  const router = useRouter();



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


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // do nothing
      }
      if (!user) {
        toast.error('Please sign up / sign in first');
        router.push('/sign-up');
      }
    });
    return () => unsubscribe();
  }, [router]);


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

  const formattedPack = (() => {
    if (testPack === 'Pack 1') return 'Pack 1';
    if (testPack === 'Pack 2') return 'Pack 2';
    if (testPack === 'Both Packs') return 'Pack 1 + Pack 2 (Both)';
    return testPack || 'N/A'; // Default case
  })();

  function calculateDiscountedPrice(originalPrice, discount) {
    const discountRate = discount; // 40% discount
    const discountAmount = originalPrice * discountRate;
    const finalPrice = originalPrice - discountAmount;
    return Math.round(finalPrice);
  }

  const totalAmount = () => {
    if (testPack === 'Pack 1') return (testDetails.pricePerPack);
    if (testPack === 'Pack 2') return (testDetails.pricePerPack);
    if (testPack === 'Both Packs') return (testDetails.pricePerPack * 2);
    return 'Invalid package selected'; // Default case
  }
  const totalAmountAfterDiscount = () => {
    if (testPack === 'Pack 1') return calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate);
    if (testPack === 'Pack 2') return calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate);
    if (testPack === 'Both Packs') return calculateDiscountedPrice(testDetails.pricePerPack * 2, testDetails.discountRate);
    return 'Invalid package selected'; // Default case
  }

  const discountedAmount = () => {
    if (testPack === 'Pack 1') return testDetails.pricePerPack - calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate);
    if (testPack === 'Pack 2') return testDetails.pricePerPack - calculateDiscountedPrice(testDetails.pricePerPack, testDetails.discountRate);
    if (testPack === 'Both Packs') return testDetails.pricePerPack * 2 - calculateDiscountedPrice(testDetails.pricePerPack * 2, testDetails.discountRate);
    return 'Invalid package selected'; // Default case
  }


  if (loadingPage && !userDetails) {
    return (
      <div>
        <NavbarLite />
        <div className="min-h-screen bg-white flex flex-col items-center w-full mx-auto pb-20">
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
      <NavbarLite />
      {userDetails ?
        <motion.div className="min-h-screen bg-white flex flex-col w-full mx-auto pb-20"
          initial={{ opacity: 0, y: 10 }}    // Start below with opacity 0
          animate={{ opacity: 1, y: 0 }}     // Fade in and move to original position
          exit={{ opacity: 0, y: 10 }}       // Exit by fading out and moving down
          transition={{ duration: 0.3 }}     // Duration of the animation
        >
          <section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 mx-auto">

            {/* Left Column */}
            <div className="md:col-span-2 w-full px-1 md:px-0 md:space-y-2">

              {/* Your Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-neutral-300 gap-2 pt-2 md:pt-8 pb-5">
                <div className="col-span-1 pt-2">
                  <h1 className="text-xl font-bold">Your Details</h1>
                </div>
                <div className="md:col-span-3 p-5 rounded-lg border border-neutral-300 gap-2 md:gap-10 text-neutral-700 flex flex-col md:flex-row justify-between">

                  <div className="flex flex-col">
                    <p className={`font-semibold`}>{userDetails.name}</p>
                    <p>{userDetails.email}</p>
                    <p>+91 {userDetails.mobile}</p>
                    <p>
                      Branch - {userDetails.branch === "ECE"
                        ? "Electronics and Communication Engineering"
                        : /engineering/i.test(userDetails.branch)
                          ? userDetails.branch
                          : `${userDetails.branch} Engineering`}
                    </p>

                    <p>{userDetails.college}</p>
                  </div>
                  <div className="md:mt-0">
                    <Link
                      className="text-[#007185] text-sm hover:underline hover:text-[#c7511f]"
                      href={'/dashboard'}
                    >
                      Update
                    </Link>
                  </div>
                </div>
              </div>

              {/* Registering For Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b gap-2 border-neutral-300 pt-6 pb-5">
                <div className="col-span-1 pt-2">
                  <h1 className="text-xl font-bold">Registering For</h1>
                </div>
                <div className="md:col-span-3 p-5 rounded-lg border border-neutral-300 gap-2 md:gap-10 text-neutral-700 flex flex-col md:flex-row justify-between">
                  <div className="flex flex-col">
                    <p className={`font-semibold`}>GATE Mock test series</p>
                    <p><span className={`font-semibold`}>Branch/Domain: </span> {testDetails.title === 'ECE' && 'Electronics and Communication Engineering'}{testDetails.title !== 'ECE' && testDetails.title}</p>
                    <p><span className={`font-semibold`}>Package: </span>{formattedPack}</p>
                    <p>*Includes {testPack === 'Pack 1' || testPack === 'Pack 2' && "3"}{testPack === 'Both Packs' && "6"} mock tests for GATE 2025</p>
                  </div>
                  <div className="md:mt-0">
                    <Link
                      className="text-[#007185] text-sm hover:underline hover:text-[#c7511f]"
                      href={'/tests'}
                    >
                      Change
                    </Link>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 py-8 px-1 lg:px-10 xl:px-14 md:hidden flex justify-center">
                <div className={`w-full flex flex-col justify-between items-center rounded-md border border-neutral-400 h-full md:h-4/5`}>
                  <div className={`p-6 flex flex-col space-y-2`}>
                    <div className={`flex flex-col gap-3 `}>
                      <button className="w-full font-bold text-md rounded-full bg-[#1e91d6] hover:bg-[#0072bb] text-white py-2 transition-all">
                        Continue to pay
                      </button>
                      <p className={`text-xs text-neutral-700 text-center px-2`}>By enrolling for this tests series, you agree to our <Link href={`/privacy-policy`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>privacy policy</Link></p>
                    </div>
                    <hr className={`h-[1px]`} />
                    <div className={`flex flex-col gap-4`}>
                      <p className={`text-black font-bold text-xl md:text-lg`}>Payment Summary</p>
                      <div className={`text-md md:text-sm flex flex-col`}>
                        <div className='flex flex-col w-full gap-1'>
                          <p className={`flex w-full justify-between items-center`}><span>Test Series:</span><span>₹{totalAmount()}.00</span></p>
                          <p className={`flex w-full justify-between items-center`}><span>Discount:</span><span>₹{discountedAmount()}.00</span></p>
                        </div>
                      </div>
                    </div>
                    <hr className={`h-[1px]`} />
                    <div>
                      <p className={`text-2xl md:text-xl font-extrabold text-[#0072bb] flex justify-between`}>
                        <span>Total Amount:</span><span>₹{totalAmountAfterDiscount()}.00</span>
                      </p>
                    </div>
                    <hr />
                    <div>
                      <p className={`flex flex-row gap-1 text-[#0072bb] text-sm font-semibold`}>
                        <span>Discount: </span><span> ₹ {discountedAmount()}.00</span><span>({testDetails.discountRate * 100}%)</span>
                      </p>
                    </div>
                  </div>
                  <div className={`px-6 w-full py-4 md:py-4 text-center bg-neutral-200 rounded-b-md flex flex-col`}>
                    <p className={`text-xs text-center`}>
                      Need help? Check our <Link href={`/faqs`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>help pages</Link> or <Link href={`/contact-us`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>Contact us</Link>
                    </p>
                  </div>
                </div>
              </div>

              <hr className={`flex md:hidden`} />

              <div className={`flex flex-col gap-3 pr-4 md:pr-10 pt-2 text-justify`}>
                <p className={`text-xs`}>
                  Need help? Check our <Link href={`/faqs`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>help pages</Link> or <Link href={`/contact-us`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>Contact us</Link>
                </p>
                <p className={`text-xs`}>
                  After completing your registration, you’ll receive a confirmation email with the details of your registration. To secure your registration, please proceed with payment through UPI. Note that your registrations will be confirmed once the payment is successfully received. <br /> Please avoid refreshing the page while your payment is being processed.
                </p>
                <p className={`text-xs`}>
                  Looking for additional test series or resources? Visit our <Link href={`/home`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>homepage</Link> or <Link href={`/tests`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>tests page</Link> to explore our other offerings.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-1 py-8 px-2 lg:px-6 xl:px-10 hidden md:flex justify-center">
              <div className={`w-full flex flex-col justify-between items-center rounded-md border border-neutral-400 h-full md:h-4/5`}>
                <div className={`p-6 flex flex-col space-y-2`}>
                  <div className={`flex flex-col gap-3 `}>
                    <button className="w-full font-bold text-md rounded-full bg-[#1e91d6] hover:bg-[#0072bb] text-white py-2 transition-all">
                      Continue to pay
                    </button>
                    <p className={`text-xs text-neutral-700 text-center px-2`}>By enrolling for this tests series, you agree to our <Link href={`/privacy-policy`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>privacy policy</Link></p>
                  </div>
                  <hr className={`h-[1px]`} />
                  <div className={`flex flex-col gap-4`}>
                    <p className={`text-black font-bold text-xl md:text-lg`}>Payment Summary</p>
                    <div className={`text-md md:text-sm flex flex-col`}>
                      <div className='flex flex-col w-full gap-1'>
                        <p className={`flex w-full justify-between items-center`}><span>Test Series:</span><span>₹{totalAmount()}.00</span></p>
                        <p className={`flex w-full justify-between items-center`}><span>Discount:</span><span>₹{discountedAmount()}.00</span></p>
                      </div>
                    </div>
                  </div>
                  <hr className={`h-[1px]`} />
                  <div>
                    <p className={`text-2xl md:text-xl font-extrabold text-[#0072bb] flex justify-between`}>
                      <span>Total Amount:</span><span>₹{totalAmountAfterDiscount()}.00</span>
                    </p>
                  </div>
                  <hr />
                  <div>
                    <p className={`flex flex-row gap-1 text-[#0072bb] text-sm font-semibold`}>
                      <span>Discount: </span><span> ₹ {discountedAmount()}.00</span><span>({testDetails.discountRate * 100}%)</span>
                    </p>
                  </div>
                </div>
                <div className={`px-6 py-2 bg-neutral-200 text-center rounded-b-md flex flex-col`}>
                  <p className={`text-xs text-center`}>
                    Need help? Check our <Link href={`/faqs`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>help pages</Link> or <Link href={`/contact-us`} className={`text-[#007185] hover:underline hover:text-[#c7511f]`}>Contact us</Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
        :
        <div className="min-h-screen bg-white flex flex-col items-center w-full mx-auto pb-20">
          <div className={`grid grid-cols-1 items-center pt-8`}>
            <div className={`max-w-7xl mx-auto px-4 md:px-10 lg:px-10`}>
              <Loader />
            </div>
          </div>
        </div>
      }
    </div>
  );
}
