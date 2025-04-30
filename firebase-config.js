// firebase-config.js

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCofbgxKSy-4B3OBhA02SHbfbplsxLk75o",
  authDomain: "clanboard-8d1c6.firebaseapp.com",
  projectId: "clanboard-8d1c6",
  storageBucket: "clanboard-8d1c6.firebasestorage.app",
  messagingSenderId: "915519944540",
  appId: "1:915519944540:web:7c59a6517f16976cd2b399",
};

// Initialize Firebase
// Ensure this check prevents re-initialization if script somehow runs twice
if (!firebase.apps.length) {
   firebase.initializeApp(firebaseConfig);
   console.log("Firebase initialized by firebase-config.js");
} else {
   firebase.app(); // if already initialized, use that app
   console.log("Firebase already initialized.");
}

// DO NOT declare auth, db, or collections here.
// const auth = firebase.auth();         <--- REMOVE
// const db = firebase.firestore();      <--- REMOVE
// const clansCollection = db.collection("clans"); <--- REMOVE
