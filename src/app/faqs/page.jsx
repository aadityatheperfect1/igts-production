"use client";
import { useState, useEffect, useLayoutEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import style from '@/components/styles/faqCSS.module.css';
import { motion } from 'framer-motion';
import Link from 'next/link';


export default function FAQPage() {

  const [faqsByCategory, setFAQsByCategory] = useState({});
  const [openIndexes, setOpenIndexes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    fetchFAQs();
    // Set a timeout for 500ms to hide the loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    // Clear the timeout if the component unmounts to avoid memory leaks
    return () => clearTimeout(timer);
  }, []);

  function groupFAQsByCategory(faqs) {
    return faqs.reduce((acc, faq) => {
      const category = faq.category || "Uncategorized"; // Default to "Uncategorized" if no category
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {});
  }

  async function fetchFAQs() {
    try {
      const response = await fetch('/api/faqs/getFAQ');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setFAQsByCategory(groupFAQsByCategory(data)); // Organize FAQs by category
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  }

  const toggleFAQ = (faqId) => {
    setOpenIndexes((prevIndexes) =>
      prevIndexes.includes(faqId)
        ? prevIndexes.filter((id) => id !== faqId)
        : [...prevIndexes, faqId]
    );
  };



  return (
    <div>
      <div className="min-h-screen flex flex-col items-center w-full mx-auto pb-20">
        <Navbar />
        <motion.div className={`grid grid-cols-1 items-center w-full`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className={`${style.topSection} w-full`}>
            <section className={`sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5`}>
              <div className={`flex flex-col gap-6 md:gap-6`}>
                <div className={`text-sm flex gap-2 text-white`}>
                  <Link href={'/'}>
                    Home
                  </Link> /
                  <Link href={'/faqs'}>
                    FAQs
                  </Link>
                </div>
                <div>
                  <h1 className={`text-4xl md:text-5xl font-bold text-white`}>
                    FREQUENTLY ASKED QUESTIONS
                  </h1>
                </div>
                <div className={`text-[17px] md:text-[18px] text-white text-justify`}>
                  <p>
                    Welcome to our FAQ page! Here you&#39;ll find answers to common questions about our services, features, and support options. We hope this helps make your experience as smooth as possible. If you need any further assistance, please don&#39;t hesitate to <Link href={'/contact-us'} className='underline '>contact us</Link>.
                  </p>
                </div>
              </div>
            </section>
          </section>
          {!isLoading && faqsByCategory ?
            <div className="md:px-10 flex flex-col items-center gap-0 md:gap-4">
              <div className={`bg-white rounded-md min-h-screen px-4 md:px-28 md:rounded-lg pb-16 pt-5 md:pt-14`}>
                {Object.entries(faqsByCategory).map(([category, faqs]) => (
                  <motion.div
                    key={category}
                    className="flex flex-col w-full pt-5 space-y-3 md:space-y-6"
                    initial={{ opacity: 0, y: 20 }}    // Start below with opacity 0
                    animate={{ opacity: 1, y: 0 }}     // Fade in and move to original position
                    exit={{ opacity: 0, y: 20 }}       // Exit by fading out and moving down
                    transition={{ duration: 0.3 }}     // Duration of the animation
                  >
                    <div>
                      <p className={`text-2xl text-gray-700 font-bold ${style.fonttAverta}`}>{category} FAQs</p>
                    </div>
                    

                    {faqs.map((faq, index) => {
                      const faqId = `${category}-${index}`; // Unique identifier for each FAQ
                      const isOpen = openIndexes.includes(faqId); // Check if the FAQ is open

                      return (
                        <div
                          key={faq._id}
                          className="bg-white border-[1.6px] rounded-xl border-gray-400 transition-all duration-300 ease-in-out"
                        >
                          <button
                            className="w-full px-5 pt-3 pb-3 md:pt-5 md:pb-4 flex justify-between items-center text-[14px] sm:text-md md:text-lg text-left font-semibold text-gray-800 focus:outline-none"
                            onClick={() => toggleFAQ(faqId)} // Use faqId as the unique identifier
                          >
                            Q. {faq.question}
                            <span
                              className={`ml-2 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="28px"
                                viewBox="0 -960 960 960"
                                width="28px"
                                fill="#565656"
                              >
                                <path d="m480-340 180-180-57-56-123 123-123-123-57 56 180 180Zm0 260q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                              </svg>
                            </span>
                          </button>

                          
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="text-black pt-2 pb-4 pl-6 md:pl-10 pr-6">{faq.answer}</p>
                          </motion.div>
                        </div>
                      );
                    })}

                  </motion.div>
                ))}
              </div>
            </div> :
            <div className={`max-w-7xl mx-auto px-4 md:px-10 lg:px-10 mt-20`}>
              <Loader />
            </div>
          }
        </motion.div>
      </div>
      <Footer />
    </div>);
}
