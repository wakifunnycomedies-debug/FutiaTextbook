// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-YuRrsDtENAkuuETCvhtva2cRMGldUAM",
  authDomain: "futiaspace-a07cc.firebaseapp.com",
  projectId: "futiaspace-a07cc",
  storageBucket: "futiaspace-a07cc.firebasestorage.app",
  messagingSenderId: "1020759362107",
  appId: "1:1020759362107:web:e05e2b16211d45633e2a1e",
  measurementId: "G-0K9V8CH8PF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);