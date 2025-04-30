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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const clansCollection = db.collection("clans"); // Reference to the 'clans' collection
