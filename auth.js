import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "./firebase"; // Import the `auth` instance from firebase.js
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const db = getFirestore();
// Signup function
export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save the user's data (including username) to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
      uid: user.uid,
      username: username, // Adding the username to the Firestore document
    });

    console.log("User signed up:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error.message);
    throw error;
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user);
    console.log("User UID:", user.uid);
    console.log("User Email:", user.email);
  } else {
    // No user is signed in
    console.log("No user is signed in.");
  }
});
// Import necessary functions from Firebase SDK

export const checkSignedIn = () => {
  const auth = getAuth(); // Initialize Firebase Authentication

  const user = auth.currentUser; // Get the current user

  if (user) {
    // If a user is signed in, get the ID token
    return getIdToken(user)
      .then((token) => {
        console.log("User is signed in, token:", token, user.uid);
        return [user.uid, token];
      })
      .catch((error) => {
        console.error("Error getting token:", error);
        return null;
      });
  } else {
    // No user is signed in
    console.log("No user is signed in");
    return null;
  }
};
