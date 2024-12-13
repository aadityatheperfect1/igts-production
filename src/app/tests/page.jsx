"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import { useSelector } from 'react-redux';
import style from "@/components/styles/testsCSS.module.css"
import Link from "next/link";
import Image from "next/image";
import tests from "@/data/tests";
import TestDetails from "./[id]/layout";
import { motion, useInView } from 'framer-motion';
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function Tests() {
  const router = useRouter();
  const { uid, userDetails, loading } = useSelector((state) => state.auth);

  function calculateDiscountedPrice(originalPrice, discountRate) {
    const discountRateTemp = discountRate;
    const discountAmount = originalPrice * discountRateTemp;
    const finalPrice = originalPrice - discountAmount;
    return Math.round(finalPrice);
  }

  const ref = useRef(null);

  // isInView will be true when the element is in the viewport
  const isInView = useInView(ref, { threshold: 0.1 }); // adjust threshold as needed

  return (
    <div>
      <div className="min-h-screen topSection flex flex-col items-center w-full mx-auto pb-20">
        <Navbar />
        <motion.div
          className={`w-full`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`w-full space-y-8 md:space-y-10`}>
            <section className={`${style.topSection} w-full`}>
              <section className={`sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5`}>
                <div className={`flex flex-col gap-6 md:gap-6`}>
                  <div className={`text-sm flex gap-2 text-white`}>
                    <Link href={'/'}>
                      Home
                    </Link> /
                    <Link href={'/tests'}>
                      GATE Mock Test
                    </Link>
                  </div>
                  <div>
                    <h1 className={`text-4xl md:text-5xl font-bold text-white`}>
                      GATE MOCK TEST
                    </h1>
                  </div>
                  <div className={`text-[17px] md:text-[18px] text-white text-justify`}>
                    <p>
                      Prepare for GATE 2025 with confidence! We, students of the Indian Institute of Space Science and Technology (IIST), have created a specialized platform to help aspirants achieve their best. Our mock tests are carefully crafted to reflect the latest GATE pattern and rigor, providing a realistic and effective preparation experience. Join us to practice, analyze, and enhance your performance.
                    </p>
                  </div>
                </div>
              </section>
            </section>
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              <section className="px-4 sm:px-0 md:px-10 lg:px-0 xl:px-8 sm:px-0 sm:max-w-xl md:max-w-6xl lg:max-w-5xl xl:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-4 xl:gap-10">
                {tests.map((test) => (
                  <motion.div
                    onClick={() => {
                      router.push(`/tests/${test.id}`);
                    }}
                    whileHover={{
                      scale: 1.0008, // Slight scaling on hover
                      y: -3, // Move upward slightly
                      boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)", // Add shadow effect
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth animation
                    key={test.id}
                    className="text-neutral-800 cursor-pointer w-full h-full border border-neutral-600 w-full pt-8 pb-2 md:pb-6 mx-auto relative overflow-hidden rounded-2xl shadow-lg bg-[#f1f7fe] px-6"
                  >
                    <div className="flex flex-col w-full h-full justify-between gap-2">
                      <div className="w-full h-full flex justify-center items-center py-12 md:py-10 bg-white rounded-2xl">
                        <div>
                          <Image
                            src={test.imageUrl}
                            width={150}
                            height={150}
                            alt={test.altText}
                          />
                        </div>
                      </div>
                      <div className="pb-4 md:pb-0 flex flex-col gap-4 md:gap-4 justify-between pt-2 w-full h-full">
                        <div className={`text-md xl:text-xl text-[#0072bb] font-extrabold`}>
                          GATE Mock for {test.title}
                        </div>
                        <div className="w-full flex flex-col gap-3 items-center">
                          <p className="text-sm w-full text-green-700 font-semibold">Special Discounted Price</p>
                          <div className={`flex flex-col w-full`}>
                            <div className={`flex items-center justify-between`}>
                              <div className={`flex items-center justify-center gap-4`}>
                                <p className={`text-neutral-500 line-through font-hairline text-strike text-xl md:text-lg lg:text-2xl`}>
                                  ₹ {test.pricePerPack}
                                </p>
                                <p className={`text-neutral-800 text-strike font-extrabold text-4xl md:text-3xl lg::text-5xl`}>
                                  ₹ {calculateDiscountedPrice(test.pricePerPack, test.discountRate)}/-
                                </p>
                              </div>
                              <div className={`px-2 py-1 bg-green-100 border border-green-900 text-green-900 text-sm font-semibold rounded-full`}>
                                {test.discountRate * 100}% OFF
                              </div>
                            </div>
                            <h1 className="text-neutral-700 font-semibold w-full text-left text-md">per package</h1>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <motion.div
                            className="px-8 w-full transition ease-in-out duration-200 py-3 text-lg text-center font-extrabold rounded-b-full rounded-tl-full text-white bg-gradient-to-b from-[#1e91d6] to-[#0072bb] hover:from-[#0072bb] hover:to-[#0072bb]"
                          >
                            Explore
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </section>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
