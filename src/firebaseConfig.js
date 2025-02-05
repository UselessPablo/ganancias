// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCsZbL6YrPW_R13DupwTPUIP3KrwXoUEIg",
    authDomain: "ganancias-7943d.firebaseapp.com",
    databaseURL: "https://ganancias-7943d-default-rtdb.firebaseio.com",
    projectId: "ganancias-7943d",
    storageBucket: "ganancias-7943d.firebasestorage.app",
    messagingSenderId: "526760040107",
    appId: "1:526760040107:web:282bc6efe904dd15f209ee"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
