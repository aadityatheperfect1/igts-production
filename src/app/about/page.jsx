"use client"
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar.jsx";
import Link from "next/link";
import style from "@/components/styles/aboutUsCSS.module.css";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div>
      <div className="min-h-screen flex flex-col items-center w-full mx-auto">
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
                  <Link href={'/about'}>
                    About
                  </Link>
                </div>
                <div>
                  <h1 className={`text-4xl md:text-5xl font-bold text-white`}>
                    About Us
                  </h1>
                </div>
                <div className={`text-[17px] md:text-[18px] text-white text-justify`}>
                  <motion.h2
                    className="text-4xl text-white font-bold text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Let&#39;s see, what Dhanak 2025 is all about?
                  </motion.h2>
                </div>
                <div>
                  <motion.p
                    className="text-lg text-gray-50 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Dhanak, the Annual Cultural Festival of the Indian Institute of Space Science and Technology, Thiruvananthapuram, continues to redefine the cultural landscape. As one of the largest cultural festivals in Southern India, it celebrates a blend of talent, creativity, and diversity. Named after the Hindi word for rainbow, DHANAK brings together a spectrum of cultures, passions, and ideas.
                  </motion.p>
                </div>
              </div>
            </section>
          </section>
          <section
            className="w-full flex flex-cols items-center justify-center pt-10 px-2 md:px-10 md:py-14 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
          >
            <motion.div
              className="max-w-5xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Header Section */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h2
                  className="text-xl md:text-2xl tracking-widest text-neutral-100 font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Theme Reveal
                </motion.h2>

                <motion.h2
                  className="text-3xl md:text-6xl tracking-widest font-bold text-indigo-400 flex gap-2 justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  DHANAK
                </motion.h2>
              </motion.div>

              {/* Video Section */}
              <motion.div
                className="px-4 pb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.video
                  src="https://ik.imagekit.io/dhanak2k25/Theme.webm/ik-video.mp4?updatedAt=1732564580429"
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="lazy-loading w-full h-auto rounded-2xl shadow-xl border-4 border-indigo-500/50"
                  poster="/path/to/fallback-image.jpg"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </section>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
