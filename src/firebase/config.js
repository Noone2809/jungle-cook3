import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCkey6VpIFn6PRiAKKj_6MaZQzwfO8XYLw",
    authDomain: "school-3bc04.firebaseapp.com",
    projectId: "school-3bc04",
    storageBucket: "school-3bc04.firebasestorage.app",
    messagingSenderId: "914161248392",
    appId: "1:914161248392:web:dbf52c6e027eecf060d73d",
    measurementId: "G-JVB45KS2XN"
};

//Firebase
const app = initializeApp(firebaseConfig);

//Authentication
export const auth = getAuth(app);
