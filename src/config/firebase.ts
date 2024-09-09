// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBDNgQPH_uHayTIeLYGahQ25lH6iempRfU',
    authDomain: 'chat-app-8a70a.firebaseapp.com',
    projectId: 'chat-app-8a70a',
    storageBucket: 'chat-app-8a70a.appspot.com',
    messagingSenderId: '825704339248',
    appId: '1:825704339248:web:21bee3dacefdc9b93cdaf5',
    measurementId: 'G-DS7KHPZZ8J',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
