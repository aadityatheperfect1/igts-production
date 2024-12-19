"use client";
import { useState, useEffect } from "react";
import NavbarLite from "@/components/NavbarLite";
import style from "@/components/styles/SignUpCSS.module.css";
import { firebaseConfig } from "@/app/firebase/config";
import { auth } from "@/app/firebase/config";
import Footer from "@/components/Footer";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";


const SignUp = () => {

  initializeApp(firebaseConfig);

  const auth = getAuth();

  const router = useRouter();
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState('');
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confpass, setCnfPass] = useState("");
  const [verified, setVerified] = useState(false);
  const [googleVerified, setGoogleVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendtimer, setTimer] = useState(45);
  const [LocalOTP, setLocalOTP] = useState(new Array(4).fill(""));
  const [isFirst, setIsFirst] = useState(true);
  const [googleUser, setGoogleuser] = useState({});
  const [otherBranch, setOtherBranch] = useState('');


  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };



  const handleGoogle = async (e) => {
    const k = toast.loading("Please Wait.");
    const provider = new GoogleAuthProvider();
    setIsFirst(false);

    setPersistence(auth, browserLocalPersistence)
      .then(async () => {

        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        setGoogleuser(user);

        // Check if user exists in the database
        const tempUser = await getUser(user.uid);
        toast.dismiss(k);

        if (tempUser.msg === "User Found") {
          router.push("/dashboard");
        } else if (tempUser.msg === "No user found") {
          const loadingToast = toast.loading("Loading...");

          setName(user.displayName);
          setEmail(user.email);
          setUsername(user.email.split("@")[0]);

          setGoogleVerified(true);
          toast.dismiss(loadingToast);
          toast.success("User Verified!");
        }

      }).catch((error) => {
        toast.dismiss(k);

        // Map specific Firebase errors to user-friendly messages
        const errorMessageMap = {
          "auth/invalid-email": "Invalid email address",
          "auth/user-disabled": "User account is disabled",
          "auth/user-not-found": "User not found",
          "auth/invalid-credential": "Incorrect Email or Password",
        };

        const errorMessage = errorMessageMap[error.code] || error.message.replace(/Firebase: | \(\w+\)\./g, "");
        toast.error(errorMessage);
        console.error(error.message, error.code);
      })
  };


  const saveGoogleUserData = async () => {
    if (mobileNumber.trim().length === 0) {
      toast.error("Please enter your mobile number");
      toast.dismiss(k);
      return;
    }
    if (mobileNumber.trim().length !== 10) {
      toast.error("Mobile number must be 10 digits");
      toast.dismiss(k);
      return;
    }
    if (selectedBranch.trim().length === 0) {
      toast.error("Please choose your B.Tech branch");
      toast.dismiss(k);
      return;
    }
    if (collegeName.trim().length === 0) {
      toast.error("Please fill your college name");
      toast.dismiss(k);
      return;
    }

    // Show the loading toast and store the id
    const k = toast.loading("Saving your account");

    try {
      const user = googleUser;
      if (user) {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currUser: user,
            username: username,
            name: name,
            mobile: mobileNumber,
            college: collegeName,
            branch: selectedBranch === 'other' ? otherBranch : selectedBranch,
          }),
        });

        // Parse the response JSON
        const data = await res.json();
        toast.dismiss(k);

        if (res.status === 200) {
          const { nUser } = data;
          await getUser(nUser.userId);
          toast.success("Welcome to GATE Mock Test!");
          router.push('/dashboard');
        } else {
          toast.error("User not created. Please contact us.");
        }
      }
    } catch (error) {
      toast.dismiss(k);

      // Handle Firebase error codes specifically, or fall back to a generic message
      const errorMessageMap = {
        "auth/invalid-email": "Invalid email address",
        "auth/user-disabled": "User account is disabled, Please contact us.",
        "auth/user-not-found": "User not found",
        "auth/invalid-credential": "Incorrect Email or Password",
      };

      const errorMessage = errorMessageMap[error.code] || error.message.replace(/Firebase: | \(\w+\)\./g, "");
      toast.error(errorMessage);
      console.error(error.message, error.code);
    }
  };




  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setLocalOTP([...LocalOTP.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus on next input field if filled
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };


  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  const verifyEmail = async () => {
    setTimer(45);
    let abc = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    let k = toast.loading("Sending OTP...");
    if (!email) {
      toast.error("Please enter email");
      toast.dismiss(k);
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid email address");
      toast.dismiss(k);
      return;
    }
    setEmail(email);
    let res = await fetch("/api/signup/sendOTP", {
      method: "POST",
      body: JSON.stringify({ email: email }),
    });
    if (res.status == 200) {
      toast.success("OTP sent to your email");
      let data = await res.json();
      setOtp(data.otp);
      setUsername(data.username);
    } else if (res.status == 201) {
      toast.error("Email already registered");
    } else {
      toast.error("Something went wrong");
    }
    toast.dismiss(k);
  }




  const resendEmail = async () => {
    let k = toast.loading("Please wait...");
    let res = await fetch("/api/signup/sendOTP", {
      method: "POST",
      body: JSON.stringify({ email: email }),
    });
    if (res.status == 200) {
      toast.success("OTP sent to your email");
      setTimer(30);
      let abc = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      let data = await res.json();
      setOtp(data.otp);
      setUsername(data.username);
    } else if (res.status == 201) {
      toast.error("Email already registered");
    } else {
      toast.error("Something went wrong");
    }
    toast.dismiss(k);
  };




  const getUser = async (uid) => {
    let res = await fetch("/api/getUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: uid }),
    });
    let resjson = await res.json();
    if (res.status == 200) {
      return resjson;
    } else {
      // toast.error(resjson.msg);
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isFirst) {
          await getUser(user.uid);
          router.push("/home");
        }
      }
    });
    return () => unsubscribe();
  }, [router, isFirst]);


  const handleSignUp = async () => {
    let k = toast.loading("Please wait...");
    // Check for empty fields and other conditions in a logical order
    if (name.trim().length === 0) {
      toast.error("Please fill your full name");
      toast.dismiss(k);
      return;
    }
    if (mobileNumber.trim().length === 0) {
      toast.error("Please enter your mobile number");
      toast.dismiss(k);
      return;
    }
    if (mobileNumber.trim().length !== 10) {
      toast.error("Mobile number must be 10 digits");
      toast.dismiss(k);
      return;
    }
    if (selectedBranch.trim().length === 0) {
      toast.error("Please choose your B.Tech branch");
      toast.dismiss(k);
      return;
    }
    if (collegeName.trim().length === 0) {
      toast.error("Please fill your college name");
      toast.dismiss(k);
      return;
    }
    if (password.trim().length === 0 || confpass.trim().length === 0) {
      toast.error("Please enter and confirm your password");
      toast.dismiss(k);
      return;
    }
    if (password !== confpass) {
      toast.error("Passwords do not match");
      toast.dismiss(k);
      return;
    }


    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const user = userCredential.user;
            if (user) {
              let res = await fetch("/api/signup", {
                method: "POST",
                body: JSON.stringify({
                  currUser: user,
                  username: username,
                  name: name,
                  mobile: mobileNumber,
                  college: collegeName,
                  branch: selectedBranch === 'other' ? otherBranch : selectedBranch,
                }),
              });
              let { nUser } = await res.json();
              toast.dismiss(k);
              if (res.status == 200) {
                await getUser(nUser.userId);
                toast.success("Welcome to GATE Mock Test!");
                router.push('/home');
              } else {
                toast.error("User not created. Please contact us.");
              }
            }
          })
          .catch((error) => {
            if (error.code === "auth/invalid-email") {
              toast.error("Invalid email address");
            } else if (error.code === "auth/user-disabled") {
              toast.error("User account is disabled");
            } else if (error.code === "auth/user-not-found") {
              toast.error("User not found");
            } else if (error.code === "auth/invalid-credential") {
              toast.error("Incorrect Email or Password");
            } else {
              let newErrorMsg = error.message.replace("Firebase: ", "");
              newErrorMsg = newErrorMsg.replace(`(${error.code}).`, "");
              toast.error(newErrorMsg);
            }
            toast.dismiss(k);
          });
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          toast.error("Invalid email address");
        } else if (error.code === "auth/user-disabled") {
          toast.error("User account is disabled");
        } else if (error.code === "auth/user-not-found") {
          toast.error("User not found");
        } else if (error.code === "auth/invalid-credential") {
          toast.error("Incorrect password");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
        toast.dismiss(k);
      });
  };



  const verifyOTP = async () => {
    let otpText = LocalOTP.join('');
    if (otpText == otp) {
      toast.success("Email verified successfully");
      setOtp("");
      setVerified(true);
    } else {
      toast.error("Incorrect otp! Please try again");
      setVerified(false);
    }
  };


  return (
    <div className={`min-h-screen topSection`}>
      <NavbarLite />
      {!otp && !verified && !googleVerified && (
        <motion.div
          className={`min-h-[calc(100vh-80px)] flex flex-col items-center mt-20 sm:mt-20 md:mt-28`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`${style.formBox} border border-[#343434]`}>
            <div className={`${style.form}`}>
              <span className={`${style.title}`}>Sign up</span>
              <span className={`${style.subtitle}`}>
                Create a free account with your email.
              </span>
              <div className={`${style.formContainer} pt-2 px-1 py-1 space-y-4`}>

                <input onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  value={email}
                  className={` w-full ${style.input} border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="Enter Your Email"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      verifyEmail();
                    }
                  }}
                />

              </div>
              <button className={`${style.formButton} border-[#343434] border`} onClick={verifyEmail}>Send OTP</button>
              <div className={`${style.dividerContainer}`}>
                <div className={`${style.divider} text-xs`}>Or using google account</div>
              </div>
              <button onClick={handleGoogle} className={`${style.GoogleButton} justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                  <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                  <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                  <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                  <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                </svg>
                Continue with Google
              </button>


            </div>
            <div className={`${style.formSection}`}>
              <p>
                Have an account? <a href="/sign-in">Sign in</a>{" "}
              </p>
            </div>
          </div>
        </motion.div>

      )}

      {otp && !verified && (
        <div className={`min-h-[calc(100vh-80px)] grid justify-center mt-6 md:mt-28 mb:14`}>
          <div className={`${style.otpForm} border-[#343434] border`}>
            <span className={`${style.mainHeading}`}>Enter OTP</span>
            <div>
              <p className={`${style.otpSubheading}`}>
                We have sent a verification code to
              </p>
              <p className={`text-[#0072bb] mt-1 ${style.emailHeading}`}>{email}</p>
            </div>
            <div className={`${style.inputContainer}`}>
              {LocalOTP.map((data, index) => (
                <input
                  key={index}
                  className={`${style.otpInput} border-[#343434] border-2`}
                  type="text"
                  name="otp"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      verifyOTP();
                    }
                  }}
                />
              ))}
            </div>
            <button onClick={verifyOTP} className={`${style.verifyButton}`} type="submit">
              Verify
            </button>
            <button onClick={() => { setOtp("") }} className={`${style.exitBtn}`} type="button">
              ×
            </button>
            <div className={`${style.resendNote}`}>
              {resendtimer > 0 && (
                <div className={`flex flex-col justify-center items-center`}>
                  <span>
                    {`Didn't receive OTP? Resend it in ${resendtimer}s.`}
                  </span>
                  <button
                    type="button"
                    className={`${style.resendBtnBefore}`}
                    onClick={resendEmail}
                  >
                    Resend Code
                  </button>
                </div>
              )}
              {resendtimer <= 0 && (
                <div className={`flex flex-col justify-center items-center`}>
                  <span className="">
                    {`Didn't receive OTP? Resend now.`}
                  </span>
                  <button
                    type="button"
                    className={`${style.resendBtn}`}
                    onClick={resendEmail}
                  >
                    Resend Code
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {verified && !otp && (
        <div className={`min-h-screen grid justify-center pb-24 mt-6 md:mt-10 mb:20`}>
          <div className={`${style.formBox} border border-[#343434] md:w-[380px]`}>
            <div className={`${style.form} md:w-[380px]`}>
              <span className={`${style.title}`}>Sign up</span>
              <span className={`${style.subtitle}`}>
                Please enter you details.
              </span>
              <div className={`${style.formContainer} w-full px-1`}>
                <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="name">Enter Your Full Name</p>
                <input onChange={(e) => setName(e.target.value)}
                  type="name"
                  required
                  value={name}
                  className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="Full Name" />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1`} htmlFor="username">Username</p>
                <input
                  type="text"
                  value={username}
                  readOnly
                  className={` w-full ${style.input2} bg-gray-200 ${style.required}  mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1`} htmlFor="username">Email</p>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className={` w-full ${style.input2} bg-gray-200 ${style.required} mb-3 border-2 focus:border-blue-400 border-[#343434] rounded-md placeholder-gray-400 text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                />
                <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="mobileNumber">Mobile Number</p>
                <div className="flex mb-3 items-center gap-1">
                  <span className={`h-[40px] text-[0.9rem] px-[10px] py-[17px] flex justify-center items-center bg-white text-gray-700 border-2 border-[#343434] rounded-l-md`}>+91</span>
                  <input
                    required
                    onChange={(e) => setMobileNumber(e.target.value)}
                    type="tel"
                    value={mobileNumber}
                    maxLength={10}
                    className={` w-full ${style.input2} border-2 focus:border-blue-400 border-[#343434] rounded-r-md text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    placeholder="XXXXXXXXXX"
                  />
                </div>
                <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="branch">B.Tech Branch</p>
                <select required id="branches" value={selectedBranch} onChange={handleBranchChange}
                  className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}>
                  <option value="">Select Branch</option>
                  <option value="ECE">ECE</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Physics">Physics</option>
                  <option value="other">Other</option>
                </select>
                {selectedBranch === 'other' &&
                  <div>
                    <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="otherBranch">Enter your branch</p>
                    <input onChange={(e) => setOtherBranch(e.target.value)}
                      type="text"
                      value={otherBranch}
                      className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                      placeholder="Branch" />
                  </div>
                }
                <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="college">College</p>
                <input onChange={(e) => setCollegeName(e.target.value)}
                  required
                  type="text"
                  value={collegeName}
                  className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="College Name" />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="password">Password</p>
                <input onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  value={password}
                  className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="Password" />
                <p className={`text-left  text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="confmPassword">Confirm Password</p>
                <input onChange={(e) => setCnfPass(e.target.value)}
                  type="password"
                  required
                  value={confpass}
                  className={` w-full ${style.input2} mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="Confirm Password" />
              </div>
              <button className={`${style.formButton} border border-[#343434]`}
                onClick={(() => {
                  setIsFirst(false);
                  handleSignUp();
                })}>Sign up</button>
            </div>
          </div>
        </div>
      )}
      {!otp && !verified && googleVerified &&
        <div className={`min-h-screen grid justify-center pb-24 mt-6 md:mt-10 mb:10`}>
          <div className={`${style.formBox} border border-[#343434] md:w-[380px]`}>
            <div className={`${style.form} md:w-[380px]`}>
              <span className={`${style.title}`}>Sign up</span>
              <span className={`${style.subtitle}`}>
                Please enter you details.
              </span>
              <div className={`${style.formContainer} w-full px-1`}>
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="name">Full Name</p>
                <input onChange={(e) => setName(e.target.value)}
                  type="name"
                  required
                  readOnly
                  value={name}
                  className={` w-full ${style.input2} bg-gray-200 ${style.required} ${style.input2}  mb-3 border-[1px] focus:border-blue-400 border-[#343434] rounded-md placeholder-gray-800 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="Full Name" />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1`} htmlFor="username">Username</p>
                <input
                  type="text"
                  value={username}
                  readOnly
                  className={` w-full ${style.input2} bg-gray-200 ${style.required} ${style.input2}  mb-3 border-[1px] focus:border-blue-400 border-[#343434] rounded-md placeholder-gray-800 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1`} htmlFor="email">Email</p>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={` w-full ${style.input2} bg-gray-200 ${style.required} ${style.input2}  mb-3 border-[1px] focus:border-blue-400 border-[#343434] rounded-md placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                />
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="mobileNumber">Mobile Number</p>
                <div className="flex mb-3 items-center gap-1">
                  <span className={`h-[40px] text-[0.9rem] px-[8px] py-[15px] flex justify-center items-center bg-white text-gray-700 border-2 border-[#343434] rounded-l-md`}>+91</span>
                  <input
                    required
                    onChange={(e) => setMobileNumber(e.target.value)}
                    type="tel"
                    value={mobileNumber}
                    maxLength={10}
                    className={` w-full ${style.input2} p-2 border-2 focus:border-blue-400 border-[#343434] rounded-r-md text-black focus:outline-none focus:ring-1 focus:ring-blue-400`}
                    placeholder="XXXXXXXXXX"
                  />
                </div>
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="branch">B.Tech Branch</p>
                <select required id="branches" value={selectedBranch} onChange={handleBranchChange}
                  className={` w-full ${style.input2}  mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}>
                  <option value="">Select Branch</option>
                  <option value="ECE">ECE</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
                <p className={`text-left text-[#0072bb] text-md ${style.fonttAverta} mb-1 ${style.required}`} htmlFor="college">College</p>
                <input onChange={(e) => setCollegeName(e.target.value)}
                  required
                  type="text"
                  value={collegeName}
                  className={` w-full ${style.input2}  mb-3 border-2 focus:border-blue-400 border-gray-700 rounded-md placeholder-gray-800 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                  placeholder="College Name" />
              </div>
              <button className={`${style.formButton} border border-[#343434]`}
                onClick={(() => {
                  setIsFirst(false);
                  saveGoogleUserData();
                })}>Sign up</button>
            </div>
          </div>
        </div>
      }
      <Footer />
    </div >
  )


};

export default SignUp;