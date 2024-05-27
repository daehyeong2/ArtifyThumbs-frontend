import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyBVCc4Cw8PeyyiM0wu157NWrUQz6j0nHfo",
  authDomain: "artifythumbs-37528.firebaseapp.com",
  projectId: "artifythumbs-37528",
  storageBucket: "artifythumbs-37528.appspot.com",
  messagingSenderId: "553390231481",
  appId: "1:553390231481:web:5f14a9f025d0d06a16f068",
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdlJekpAAAAAPntQCZ-dzTDWlkCPt73eVigBfIc"),

  isTokenAutoRefreshEnabled: true,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
