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
          <section>
            <motion.div className={`w-full grid space-y-8 md:space-y-10 items-center justify-center pt-10 md:pt-4 pb-10 px-2 md:px-10 md:pb-14 bg-gray-900 text-white`}>
              <div className={`flex justify-center items-center text-center`}>
                <h1 className={`text-3xl md:text-4xl tracking-wider font-bold`}>
                  FOLLOW US
                </h1>
              </div>
              <div className="flex justify-between w-full space-x-10">
                <a href='https://www.instagram.com/dhanak.iist/' target='_blank' className={`${style.button}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    height="24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-6 h-6 text-gray-800 dark:text-white"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                      fill-rule="evenodd"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>

                <a href='https://x.com/dhanakiist' target='_blank' className={`${style.button}`}>
                  <svg
                    viewBox="0 0 512 512"
                    height="1.7em"
                    xmlns="http://www.w3.org/2000/svg"
                    class="svgIcontwit"
                    fill="white"
                  >
                    <path
                      d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                    ></path>
                  </svg>
                </a>

                <a href='https://www.youtube.com/@DhanakIIST' target='_blank' className={`${style.button}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-6 h-6 text-gray-800 dark:text-white"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </a>

                <a href='https://www.facebook.com/@iist.dhanak' target='_blank' className={`${style.button}`}>
                  <svg
                    viewBox="0 0 320 512"
                    height="1.2em"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
                    ></path>
                  </svg>
                </a>

              </div>
            </motion.div>
          </section>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
