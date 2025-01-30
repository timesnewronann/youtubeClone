// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const firebaseConfig = {
    apiKey: "AIzaSyDdHBFmC2YRN24CKXyiz2q9GVwQWgh1ehc",
    authDomain: "yt-clone-80b84.firebaseapp.com",
    projectId: "yt-clone-80b84",
    appId: "1:663031018613:web:c20790a7f556963fd1f43c",
    measurementId: "G-X27THPKZFF"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentia;s.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}