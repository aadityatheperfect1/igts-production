import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import style from '@/components/styles/navbar.module.css'
import { firebaseConfig } from "@/app/firebase/config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useSelector } from 'react-redux';
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";


const Navbar = () => {

    const { uid, userDetails, loading } = useSelector((state) => state.auth);


    initializeApp(firebaseConfig);
    let [isLoggedIn, setLoginSatate] = useState(false);
    const auth = getAuth();


    useEffect(() => {
        if (uid) {
            setLoginSatate(true);
        }
    }, [uid]);


    return (
        <motion.nav
            className={`bg-white backdrop-blur-md pt-8 lg:pt-6 pb-1 md:pb-5 px-4 items-center sticky top-0 w-full z-50 shadow-sm border-gray-400`}
        >
            <div className={`max-w-screen-xl mx-auto justify-around lg:justify-between flex items-center`}>
                <motion.div>
                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="Website Logo"
                            className="h-8 hidden md:inline-block"
                            width={180} // Set width to match the display size of the image
                            height={100} // Adjust height based on the aspect ratio of your image
                            priority // Optionally, add this if it’s an important image (e.g., above-the-fold content)
                        />
                    </Link>
                    <Link href="/">
                        <Image
                            src="/images/logo_half.png"
                            alt="Website Logo"
                            className="h-10 md:hidden"
                            width={50} // Set width to match the display size of the image
                            height={50} // Adjust height based on the aspect ratio of your image
                            priority // Optionally, add this if it’s an important image (e.g., above-the-fold content)
                        />
                    </Link>
                </motion.div>
                <motion.div className={`hidden lg:inline-block flex items-center justify-center space-x-6`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                >
                    <Link href={`/home`} className={`text-[#3c4852] ${style.fonttAverta} bg-white hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-4 py-2.5 me-2 mb-2`}>
                        Home
                    </Link>
                    <Link href={`/tests`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-4 py-2.5 me-2 mb-2`}>
                        Tests
                    </Link>
                    <Link href={`/about`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-4 py-2.5 me-2 mb-2`}>
                        About
                    </Link>
                    <Link href={`/contact-us`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300 rounded-md text-sm lg:text-md px-4 py-2.5 me-2 mb-2`}>
                        Contact us
                    </Link>
                    <Link href={`/faqs`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-4 py-2.5 me-2 mb-2`}>
                        FAQs
                    </Link>
                </motion.div>
                <div>
                    <AnimatePresence mode="wait">
                        {isLoggedIn ?
                            <motion.div className={`flex flex-wrap justify-center items-center`}
                                key="dashboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                <button onClick={() => {
                                    signOut(auth);
                                    window.location.href = "/";
                                }}
                                    className={`text-[#3c4852] ${style.fonttAverta}  bg-white hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-5 py-2.5 me-2 mb-2`}>
                                    Logout
                                </button>

                                <Link href={`/dashboard`} className={`text-white ${style.fonttAverta} flex items-center justify-center gap-2 bg-[#674cee] hover:bg-[#4d2deb] focus:ring-4 focus:ring-blue-300 rounded-md text-sm lg:text-md px-[1rem] py-2.5 me-2 mb-2`}>
                                    <svg
                                        className="lucide lucide-rocket"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        stroke="#FFFFFF"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        height="20"
                                        width="20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
                                        ></path>
                                        <path
                                            d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                                        ></path>
                                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>


                            </motion.div>
                            : <motion.div className={`flex flex-wrap justify-center items-center`}
                                key="register"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Link href={`/sign-in`} className={`text-[#3c4852] ${style.fonttAverta}  bg-white hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-sm lg:text-md px-5 py-2.5 me-2 mb-2`}>
                                    Login
                                </Link>
                                <Link href={`/sign-up`} className={`text-white ${style.fonttAverta} flex items-center justify-center gap-2 bg-[#674cee] hover:bg-[#4d2deb] focus:ring-4 focus:ring-blue-300  rounded-md text-sm px-5 py-2.5 me-2 mb-2`}>
                                    <svg
                                        className="lucide lucide-newspaper text-blue-400 dark:text-blue-600"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        stroke="#FFFFFF"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        height="20"
                                        width="20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
                                        ></path>
                                        <path d="M18 14h-8"></path>
                                        <path d="M15 18h-5"></path>
                                        <path d="M10 6h8v4h-8V6Z"></path>
                                    </svg>
                                    Register Now
                                </Link>
                            </motion.div>}
                    </AnimatePresence>
                </div>
            </div>
            <div className={`lg:hidden mt-3 justify-around items-center flex flex-wrap`}>
                <Link href={`/home`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-[14px] px-3 py-2.5 mb-2`}>
                    Home
                </Link>
                <Link href={`/tests`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-[14px] px-3 py-2.5 mb-2`}>
                    Tests
                </Link>
                <Link href={`/about`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-[14px] px-3 py-2.5 mb-2`}>
                    About
                </Link>
                <Link href={`/contact-us`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-[14px] px-3 py-2.5 mb-2`}>
                    Contact us
                </Link>
                <Link href={`/faqs`} className={`text-[#3c4852] ${style.fonttAverta} bg-white  hover:bg-[#e9eef2] transition ease-in-out duration-300  rounded-md text-[14px] px-3 py-2.5 mb-2`}>
                    FAQs
                </Link>
            </div>
        </motion.nav>
    );
}

export default Navbar;
