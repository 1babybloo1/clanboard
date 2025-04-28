// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzhq6XQFLW8XnLby9INMAz5mUbvNEJ130",
  authDomain: "clanboard.firebaseapp.com",
  projectId: "clanboard",
  storageBucket: "clanboard.firebasestorage.app",
  messagingSenderId: "966112231326",
  appId: "1:966112231326:web:7233edeba6ba1945e1a08f",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const clansCollection = db.collection("clans"); // Reference to the 'clans' collection
