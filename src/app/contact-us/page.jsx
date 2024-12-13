"use client"
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import style from '@/components/styles/contactusCSS.module.css'
import { useLayoutEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactUs() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    // Set a timeout for 500ms to hide the loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    // Clear the timeout if the component unmounts to avoid memory leaks
    return () => clearTimeout(timer);
  }, []);

  async function submitContactForm({ name, email, message }) {
    const k = toast.loading("Sending Message...");
    try {
      // Define the request payload
      const payload = {
        name,
        email,
        message,
      };

      // Make the API call
      const response = await fetch("/api/sendUserQuery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      const result = await response.json();

      if (!response.ok) {
        toast.dismiss(k);
        toast.error("Failed to send, Please try again.");
        throw new Error(result.error || "Failed to send the message");
      }

      toast.dismiss(k);
      toast.success("Message sent.");

      return { success: true, message: result.message };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return { success: false, error: error.message };
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const result = await submitContactForm(formData);
    if (result.success) {
      setStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };



  return (
    <div>

      <div className="min-h-screen topSection flex flex-col items-center w-full mx-auto pb-20">
        <Navbar />
        <motion.section
          className={`${style.topSection} w-full`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className={`sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl md:px-0 px-3 md:px-8 lg:px-5 mx-auto pt-10 pb-5`}>
            <div className={`flex flex-col gap-6 md:gap-6`}>
              <div className={`text-sm flex gap-2 text-white`}>
                <Link href={'/'}>
                  Home
                </Link> /
                <Link href={'/contact-us'}>
                  Contact us
                </Link>
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold text-white`}>
                  CONTACT US
                </h1>
              </div>
              <div className={`text-[17px] md:text-[18px] text-white text-justify`}>
                <p>
                  Welcome to our Contact Us page! We&#39;re here to answer any questions, receive feedback, or assist with any concerns you may have. Please fill out the form below to send us a message, and our team will get back to you as soon as possible. We look forward to connecting with you!                </p>
              </div>
            </div>
          </section>
        </motion.section>
        <motion.div
          className="mx-auto px-4 md:px-2 lg:px-2 py-8"
          initial={{ opacity: 0, y: 10 }}    // Start below with opacity 0
          animate={{ opacity: 1, y: 0 }}     // Fade in and move to original position
          exit={{ opacity: 0, y: 10 }}       // Exit by fading out and moving down
          transition={{ duration: 0.5 }}     // Duration of the animation
        >
          <div className="grid grid-cols-1 gap-y-0 gap-10 lg:gap-0 lg:grid-cols-2 lg:gap-6 justify-between items-center">
            {/* Image Section */}
            <div className="w-full h-full flex justify-center items-center ">
              <div className="flex flex-col items-center justify-center">
                <Image
                  src='https://ik.imagekit.io/dhanak2k25/contact.png'
                  alt="contact us png"
                  className="w-full h-auto hidden lg:inline-block object-cover"
                  width={600} // Set width to match the display size of the image
                  height={400} // Adjust height based on the aspect ratio of your image
                  priority // Optionally, add this if it’s an important image (e.g., above-the-fold content)
                />
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="w-full h-full grid justify-center items-center ">
              <div className="px-0 md:px-2 lg:px-2 py-3">
                <div className="bg-[#f1f7fe] rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
                  <div className={`flex flex-col gap-3`}>
                    <h2 className={`text-2xl font-bold text-gray-800 mb-2 text-center ${style.fonttAverta}`}>Send Message</h2>
                    <p className={`mb-4 text-gray-600`}>Please fill the form, we&apos;ll contact you soon.</p>
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className={`block font-bold text-[#0072bb] mb-1 ${style.fonttAverta}`} htmlFor="name">Your Name</label>
                      <input
                        value={formData.name}
                        onChange={handleChange}
                        className={`${style.input} w-full px-4 py-2 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        placeholder="Enter your name"
                        type="text"
                        name="name"
                        id="name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`block font-bold text-[#0072bb] mb-1 ${style.fonttAverta}`} htmlFor="email">Your Email</label>
                      <input
                        value={formData.email}
                        onChange={handleChange}
                        className={`${style.input} w-full px-4 py-2 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        placeholder="Enter your email"
                        name="email"
                        id="email"
                        type="email"
                      />
                    </div>
                    <div className="mb-4">
                      <label className={`block font-bold text-[#0072bb] mb-1 ${style.fonttAverta}`} htmlFor="message">Your Message</label>
                      <textarea
                        value={formData.message}
                        onChange={handleChange}
                        className={`bg-transparent w-full px-4 py-2 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                        rows="4"
                        placeholder="Enter your message"
                        name="message"
                        id="message"
                      ></textarea>
                    </div>
                    <button
                      onClick={() => { handleSubmit(); }}
                      className={`${style.formButton} w-full rounded-xl border border-[#343434] flex gap-2 justify-center items-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
      <Footer />
    </div >
  );
}
