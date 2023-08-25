import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyDfOIF4Zf6BDBKlO7Mo4btwWKNsmGRlUbY",
    authDomain: "chatnow-45aad.firebaseapp.com",
    projectId: "chatnow-45aad",
    storageBucket: "chatnow-45aad.appspot.com",
    messagingSenderId: "30883514956",
    appId: "1:30883514956:web:9da72850641adb76cb02e9",
    measurementId: "G-N8XS8RCRPL"
  };

  const app=initializeApp(firebaseConfig);
  export const firebaseAuth=getAuth(app);