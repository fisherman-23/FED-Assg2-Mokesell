import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs
import Compressor from "compressorjs";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  arrayUnion,
  setDoc,
  getDocs,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { float } from "three/tsl";

const db = getFirestore();
const storage = getStorage();
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
      const docRef = await addDoc(collection(db, "listings"), newListing);
      console.log("Document written with ID: ", docRef.id);

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
    // Create a reference to the Firebase Storage location
    const storageRef = ref(storage, "images/" + uniqueFileName);

    // Create a file upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor upload progress and completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress monitoring (optional)
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // Reject the promise with the error
        console.error("Upload error:", error);
        reject("Upload failed: " + error.message);
      },
      () => {
        // Get download URL after successful upload
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log("File available at:", downloadURL);
            resolve(downloadURL); // Resolve the promise with the download URL
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            reject("Error getting download URL: " + error.message);
          });
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
      maxWidth: 768, // Maximum width (resize to fit within this width)
      maxHeight: 768, // Maximum height (resize to fit within this height)
      success(result) {
        file = result;

        // Create reference to the Firebase Storage location
        const storageRefThumb = ref(storage, "images/thumb_" + uniqueFileName);

        // Create a file upload task for the compressed image
        const uploadTaskThumb = uploadBytesResumable(storageRefThumb, file);

        // Monitor upload progress and completion
        uploadTaskThumb.on(
          "state_changed",
          (snapshot) => {
            // Progress monitoring (optional)
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            // Reject the promise with the error
            console.error("Upload error:", error);
            reject("Upload failed: " + error.message);
          },
          () => {
            // Get download URL after successful upload
            getDownloadURL(uploadTaskThumb.snapshot.ref)
              .then((downloadURL) => {
                console.log("Thumbnail available at:", downloadURL);
                resolve(downloadURL); // Resolve the promise with the download URL
              })
              .catch((error) => {
                console.error("Error getting thumbnail URL:", error);
                reject("Error getting thumbnail URL: " + error.message);
              });
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
