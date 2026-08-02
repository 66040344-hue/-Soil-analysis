const firebaseConfig = {
  apiKey: "AIzaSyBidWt8gPcRqQ2wwQupGNUYk01OGvAJQyc",
  authDomain: "soil-analysis-eb7f5.firebaseapp.com",
  projectId: "soil-analysis-eb7f5",
  storageBucket: "soil-analysis-eb7f5.firebasestorage.app",
  messagingSenderId: "931526508607",
  appId: "1:931526508607:web:917902ba08e7f98337f88a",
  measurementId: "G-C80DLMSVG3"
};

// Initialize Firebase (using compat library for global scope access)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firestore reference
const db = firebase.firestore();
