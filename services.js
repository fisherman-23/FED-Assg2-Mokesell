import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
} from "firebase/firestore";

const db = getFirestore();
// this will contain all Firebase CRUD operations not related to authentication
// get user data from Firestore with a given UID
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const getListings = async () => {
  // get all listings from Firestore
  try {
    const listings = [];
    const querySnapshot = await getDocs(collection(db, "listings"));
    querySnapshot.forEach((doc) => {
      listings.push(doc.data());
    });
    return listings;
  } catch (error) {
    console.error("Error getting listings:", error);
    throw error;
  }
};

export const getListingsByIds = async (listingIds) => {
  // Get specific listings based on provided IDs
  try {
    const listings = [];
    const listingsRef = collection(db, "listings");

    for (let id of listingIds) {
      const docRef = doc(listingsRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        listings.push(docSnap.data());
      } else {
        console.log(`No such document with ID: ${id}`);
      }
    }

    return listings;
  } catch (error) {
    console.error("Error getting listings by IDs:", error);
    throw error;
  }
};

export const createListing = async (listing) => {
  // create a new listing in Firestore
  try {
    const docRef = await addDoc(collection(db, "listings"), listing);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};
