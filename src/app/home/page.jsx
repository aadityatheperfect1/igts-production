"use client"
import NavbarHome from "@/components/NavbarHome.jsx";
import Footer from "@/components/Footer.jsx";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import style from '@/components/styles/homeCSS.module.css';
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.3,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const buttonVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { duration: 0.5, ease: "backOut" } },
  };

  const gradientVariants = {
    hidden: { opacity: 0, scaleX: 0 },
    visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  const featureData = [
    {
      title: "Expert-Curated Mock Tests",
      description: "Prepare with questions designed by GATE toppers and experts under the guidance of top professors at IIST.",
      icon: "school", // Suggests expertise and education.
    },
    {
      title: "Affordable and Up-to-Date",
      description: "Experience test series aligned with the latest GATE 2025 pattern, all at a student-friendly price.",
      icon: "monetization_on", // Represents affordability.
    },
    {
      title: "Realistic Exam Experience",
      description: "Simulate the real GATE exam environment with our platform for effective preparation.",
      icon: "event", // Represents a real-time, scheduled feel.
    },
  ];
  const howItWorks = [
    { title: "Register / Sign Up", description: "Register on the website using email or Google account." },
    { title: "Complete Your Profile", description: "Fill in your details to complete your profile." },
    { title: "Select Your Package", description: "Go to the tests page and select a suitable package." },
    { title: "Proceed to Pay", description: "Move forward to the payment section." },
    { title: "Complete Payment", description: "Pay the amount to complete your registration." },
    { title: "Stay Updated", description: "Keep visiting the website for further announcements." },
  ];


  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        type: "spring",
        stiffness: 50,
      },
    }),
  };


  return (
    <div>
      <NavbarHome />
      <div className={`flex flex-col items-center w-full mx-auto`}>

        <motion.div
          className={`w-full`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero Section */}
          <motion.div
            className={`heroSection ${style.bgHome} min-h-[calc(100vh-150px)] lg:min-h-[calc(100vh-110px)] xl:min-h-[calc(100vh-80px)] bg-white w-full flex flex-col items-center justify-center text-white text-center px-6`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="flex flex-col justify-center max-w-5xl mx-auto px-4 text-center">
              {/* Heading Section */}
              <motion.div
                className="flex flex-col items-center justify-center"
                variants={textVariants}
              >
                <h1 className="text-xl md:text-2xl text-gray-800 flex items-center justify-center">
                  <motion.p className="font-hairline" variants={textVariants}>
                    Get ready for
                  </motion.p>
                  <motion.p className="font-bold ml-3" variants={textVariants}>
                    GATE 2025
                  </motion.p>
                </h1>
              </motion.div>

              {/* Hero Text */}
              <motion.div
                className="h-full flex flex-col items-center justify-center mt-20 mb-20 md:mt-16 md:mb-16"
                variants={textVariants}
              >
                <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-10">
                  <motion.p
                    className="text-3xl heroText md:text-6xl text-black"
                    variants={textVariants}
                  >
                    CRACK <span className="font-extrabold text-[#674cee] tracking-wider gateTextFont">GATE 2025</span>{" "}
                    WITH CONFIDENCE
                  </motion.p>
                  <motion.h2
                    className="text-2xl mt-10 font-bold md:text-3xl font-extrabold text-[#674cee] mt-4"
                    variants={textVariants}
                  >
                    Mock Tests Designed Just for You!
                  </motion.h2>
                </div>
              </motion.div>

              {/* Call-to-Action Button */}
              <motion.div
                className="flex w-full justify-center items-start"
                variants={buttonVariants}
              >
                <Link
                  href="/tests"
                  className="bg-gradient-to-b from-[#7c65f1] to-[#674cee] text-white py-3 px-8 rounded-b-full rounded-tl-full text-lg font-thin shadow-md transition transform hover:scale-105"
                >
                  Explore GATE Mock Tests
                </Link>
              </motion.div>


            </div>
          </motion.div>

          <div className={`bg-gradient-to-b from-[#ffffff] to-[#d0c7ff] pt-2 md:pt-10 pb-8 md:pb-20`}>
            <div className="max-w-7xl whyChooseUs text-center text-white mx-auto">
              <motion.h2
                className="text-4xl text-[#674cee] font-bold mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Why Choose Our Platform?
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-20">
                {featureData.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="featureCard bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 0 }} // Starts with lower opacity and slightly off-screen
                    whileInView={{ opacity: 1, y: 0 }} // Animates to full opacity and original position
                    viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of the element is in view
                    transition={{
                      duration: 0.3, // Smooth animation time
                      delay: index * 0.1, // Add delay for staggered animation
                      ease: [0.42, 0, 0.58, 1], // Smooth easing curve
                    }}
                  >
                    <h3 className="text-xl font-semibold text-[#674cee] mb-4">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>


          {/* How It Works Section */}
          <div className={`bg-[#d0c7ff] pt-10 pb-20`}>
            <div className="max-w-6xl text-center text-white mx-auto flex flex-col items-center gap-10">
              <motion.h2
                className="text-4xl text-[#674cee] font-bold mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                How It Works?
              </motion.h2>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16 px-6 md:px-20">

                {howItWorks.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="featureCard relative bg-white pt-12 pb-8 px-10 rounded-full shadow-lg transition transform hover:scale-105 z-10"
                    initial={{ opacity: 0, scale: 1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: [0.42, 0, 0.58, 1],
                    }}
                  >
                    {/* Step Number Circle (Visual Node) */}
                    <div className="absolute top-[-30px] transform left-1/2 -translate-x-1/2 w-16 h-16 bg-[#674cee] text-white rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>

                    <h3 className="text-xl font-semibold text-[#674cee] mb-4">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>


          {/* Dhanak Section */}
          {/* <div className="bg-gradient-to-b from-[#ffffff] to-[#9e8df2] min-h-[calc(100vh-80px)] py-20">
            <div className="max-w-6xl mx-auto px-6">
              <motion.h2
                className="text-4xl text-[#674cee] font-bold text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Let's see, what Dhanak 2025 is all about?
              </motion.h2>

              <motion.p
                className="text-lg text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Dhanak, the Annual Cultural Festival of the Indian Institute of Space Science and Technology, Thiruvananthapuram, continues to redefine the cultural landscape. As one of the largest intercollegiate festivals in Southern India, it celebrates a blend of talent, creativity, and diversity. Named after the Hindi word for 'rainbow,' DHANAK brings together a spectrum of cultures, passions, and ideas.
              </motion.p>

              <motion.p
                className="text-lg text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Now in its fourteenth edition, Dhanak 2025 is set to mesmerize attendees with its unique theme, "Fivefold Symphony," an ode to the harmonious convergence of diverse cultures, arts, and expressions. Over the course of four vibrant days, Dhanak will showcase music, dance, theater, literature, and visual arts in a perfect symphony of creativity.
              </motion.p>

              <motion.p
                className="text-lg text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Each year, Dhanak brings with it a unique theme that defines its spirit. Past themes like "Retro Revival," "Pop Culture," and "Enchanted" have inspired breathtaking performances and captivating decor. Dhanak 2025’s theme, "Fivefold Symphony," will unite the elements of music, rhythm, art, dance, and literature, creating a mesmerizing and immersive experience for all.
              </motion.p>

              <motion.p
                className="text-lg text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Scheduled from March 15th to 18th, Dhanak 2025 promises an unforgettable celebration of artistic expression, uniting the beauty of multiple art forms under one roof. The festival will transport you into a world of music and rhythm, accompanied by stunning performances and decor that perfectly capture the essence of the theme.
              </motion.p>

              <motion.p
                className="text-lg text-gray-800 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Join us at Dhanak 2025, as we compose a symphony of creativity, culture, and passion. Let the music of diversity unite us and inspire a journey of artistic brilliance. Get ready to experience the magic of "Fivefold Symphony" at Dhanak 2025!
              </motion.p>
            </div>
          </div> */}



          {/* Call to Action */}
          <div className="ctaSection w-full pt-5 pb-16 bg-gradient-to-b from-[#d0c7ff] to-[#ffffff] text-center text-white space-y-12">
            <motion.h2
              className="text-4xl text-[#674cee] font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Start Your GATE Journey?
            </motion.h2>
            <p className="mt-4 text-lg text-gray-800">Join thousands of aspirants and start practicing now.</p>
            <motion.div
              className="flex w-full justify-center items-start"
              variants={buttonVariants}
            >
              <Link
                href="/tests"
                className="bg-gradient-to-b from-[#7c65f1] to-[#674cee] text-white py-3 px-8 rounded-b-full rounded-tl-full text-lg font-thin shadow-md transition transform hover:scale-105"
              >
                Register Now!
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
