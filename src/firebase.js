import firebase from 'firebase/app';

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore"; 
import "firebase/database"

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCZrVVh8gHwh06PtaeE8v8ek97oOsooQAs",
    authDomain: "community-library-35509.firebaseapp.com",
    databaseURL: "https://community-library-35509-default-rtdb.firebaseio.com/",
    projectId: "community-library-35509",
    storageBucket: "community-library-35509.appspot.com",
    messagingSenderId: "192583184682",
    appId: "1:192583184682:web:96bba6d3c9ef09bb50ee53"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
