// firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyBKBBTwXlnKRFK1egKhP6O-2bINqXr3rBs",
    authDomain: "aguaconciencia-ba7d9.firebaseapp.com",
    databaseURL: "https://aguaconciencia-ba7d9-default-rtdb.firebaseio.com",
    projectId: "aguaconciencia-ba7d9",
    storageBucket: "aguaconciencia-ba7d9.appspot.com",
    messagingSenderId: "570695419322",
    appId: "1:570695419322:web:f9ab5d63598480d8db4983",
    measurementId: "G-8GZL55QCF2"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
