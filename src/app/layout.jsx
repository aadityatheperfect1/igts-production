"use client";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { setUID, fetchUserDetails, clearAuth } from '@/libs/features/auth/authSlice';
import store from '@/libs/store';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from "react";


import { firebaseConfig } from "@/app/firebase/config";

import { initializeApp } from "firebase/app";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function RootLayout({ children }) {

  return (
    <Provider store={store}>
      <html lang="en" className={`custom-scrollbar`}>
        <body>
          <ProgressBar
            height="3px"
            color="#674cee"
            options={{ showSpinner: false }}
            shallowRouting
          />
          <LoadAuth />
          <Toaster />
          {children}
        </body>
      </html>
    </Provider>
  );
}



function LoadAuth() {
  initializeApp(firebaseConfig);
  const auth = getAuth();
  const dispatch = useDispatch();
  const uid = useSelector((state) => state.auth.uid);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUID(user.uid));
        dispatch(fetchUserDetails(user.uid));
      } else {
        dispatch(clearAuth());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
}
