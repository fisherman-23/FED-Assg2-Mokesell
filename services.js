/**
 * @fileoverview
 * This script provides Firebase CRUD operations for managing user data, listings, chats, messages, and offers.
 * It includes functions to create and fetch listings, upload images and thumbnails, manage user information,
 * and handle chat messages and offers for listings. Firebase Firestore and Storage are used for data storage.
 *
 * @author Jing Shun
 */

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs
import Compressor from "compressorjs";
import {
  getFirestore,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  arrayUnion,
  setDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { float } from "three/tsl";

// Initialize Firebase services
const db = getFirestore();
const storage = getStorage();

// this will contain all Firebase CRUD operations not related to authentication

export const getUserData = async (uid) => {
  // get user data from Firestore with a given UID
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
  // create a new listing in Firestore, takes a listing object as input
  // get user uid
  const user = getAuth().currentUser;
  if (!user) {
    console.error("User not logged in");
    return;
  }

  try {
    let file = listing.img;
    console.log("Uploading image:", file); // If upload is successful
    const downloadURL = await uploadImage(file);
    console.log("Download URL:", downloadURL); // If upload is successful

    const thumbnailURL = await uploadThumbnail(file);
    console.log("Thumbnail URL:", thumbnailURL); // If upload is successful

    // create a new listing in Firestore
    try {
      let newListing = {
        name: listing.name,
        price: parseFloat(listing.price),
        image: downloadURL,
        thumbnail: thumbnailURL,
        description: listing.desc,
        category: listing.category,
        condition: listing.condition,
        seller: user.uid,
        likes: 0,
        bump: 0,
        lastBump: null,
        createdAt: new Date(),
      };

      // Add new listing document
      const docRef = doc(collection(db, "listings")); // Generate a new document reference
      newListing.id = docRef.id; // Assign the generated ID to the object

      await setDoc(docRef, newListing); // Add the document with the custom ID

      // Reference to user document
      const userRef = doc(db, "users", user.uid);

      // Update user's listings array efficiently using arrayUnion
      await updateDoc(userRef, {
        listings: arrayUnion(docRef.id),
      });

      console.log("User document updated successfully with new listing ID");
    } catch (error) {
      console.error("Error adding document or updating user:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error uploading image:", error); // If there is an error
  }
};

// upload image to Firebase Cloud Storage
export const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `${Date.now()}_${uuidv4()}_${file.name}`;
    const storageRef = ref(storage, "images/" + uniqueFileName);

    // Define metadata with a 2-day cache control, this allows for image caching
    const metadata = {
      cacheControl: "public, max-age=172800", // 172800 seconds which is 2 days
    };

    // Create a file upload task with metadata
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    // Monitor upload progress and completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Upload error:", error);
        reject("Upload failed: " + error.message);
      },
      async () => {
        try {
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at:", downloadURL);
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL:", error);
          reject("Error getting download URL: " + error.message);
        }
      }
    );
  });
};

export const uploadThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `${Date.now()}_${uuidv4()}_${file.name}`;

    // Get size of original file
    const fileSize = file.size;

    // Determine quality of image compression based on file size
    let quality = fileSize > 100 * 1024 ? 0.75 : 0.85;

    // Compress the image
    new Compressor(file, {
      quality: quality,
      maxWidth: 768, // Maximum width
      maxHeight: 768, // Maximum height
      success(result) {
        file = result;

        // Create reference to the Firebase Storage location
        const storageRefThumb = ref(storage, "images/thumb_" + uniqueFileName);

        // Define metadata with a 2-day cache control
        const metadata = {
          cacheControl: "public, max-age=172800", // Cache for 2 days (172800 seconds)
        };

        // Create a file upload task for the compressed image with metadata
        const uploadTaskThumb = uploadBytesResumable(
          storageRefThumb,
          file,
          metadata
        );

        // Monitor upload progress and completion
        uploadTaskThumb.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Upload error:", error);
            reject("Upload failed: " + error.message);
          },
          async () => {
            try {
              // Get download URL after successful upload
              const downloadURL = await getDownloadURL(
                uploadTaskThumb.snapshot.ref
              );
              console.log("Thumbnail available at:", downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error("Error getting thumbnail URL:", error);
              reject("Error getting thumbnail URL: " + error.message);
            }
          }
        );
      },
      error(error) {
        console.error("Image compression error:", error);
        reject("Image compression failed: " + error.message);
      },
    });
  });
};

export const getChats = async (id) => {
  // id is a list of chat IDs
  try {
    const chatRef = collection(db, "chats");
    const querySnapshot = await getDocs(chatRef);
    const chats = [];
    querySnapshot.forEach((doc) => {
      if (id.includes(doc.id)) {
        chats.push(doc);
      }
    });
    return chats;
  } catch (error) {
    console.error("Error getting chats:", error);
    throw error;
  }
};

export const getChatById = async (chatId) => {
  // get chat data from Firestore with a given chat ID
  try {
    const docRef = doc(db, "chats", chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting chat:", error);
    throw error;
  }
};

export const getMessagesById = async (chatId) => {
  // get messages from Firestore with a given chat ID
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const querySnapshot = await getDocs(messagesRef);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

export const sendMessageToFirestore = async (chatId, message) => {
  // send a message to Firestore with a given chat ID and message object
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messagesRef, message);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getUsernameById = async (uid) => {
  // get username from Firestore with a given UID
  try {
    const docRef = doc(db, "users", uid);
    console.log(docRef);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().username;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting username:", error);
    throw error;
  }
};

export const createChat = async (chat) => {
  // create a new chat in Firestore, takes a chat object as input
  try {
    const chatRef = collection(db, "chats");
    const docRef = await addDoc(chatRef, chat);
    return docRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const uploadOffer = async (listingId, offer) => {
  // Create a new offer in Firestore for the given listing
  try {
    const offersRef = collection(db, `listings/${listingId}/offers`); // Create a reference to the offers subcollection
    const docRef = doc(db, `listings/${listingId}/offers`, offer.buyerId); // Create a new document reference
    await setDoc(docRef, offer); // Set the document with the custom ID
    return docRef; // Return the document reference for further use if needed
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

export const getAllOffers = async (listingId) => {
  // Fetch all offers for a given listing
  try {
    console.log("Listing ID:", listingId);
    // Reference the 'offers' subcollection within the given listing
    const offersRef = collection(db, `listings/${listingId}/offers`);

    // Fetch all documents in the 'offers' subcollection
    const querySnapshot = await getDocs(offersRef);

    // Map the documents to an array of their data
    const offers = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Include the document ID
      ...doc.data(), // Spread the document data
    }));

    return offers;
  } catch (error) {
    console.error("Error getting offers:", error);
    throw error;
  }
};
