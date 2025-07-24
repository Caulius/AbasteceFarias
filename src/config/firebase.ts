import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOfoegfmpMKOHQa_3wjplB-amgShQjcRk",
  authDomain: "fariasabastecimento.firebaseapp.com",
  projectId: "fariasabastecimento",
  storageBucket: "fariasabastecimento.firebasestorage.app",
  messagingSenderId: "901866628883",
  appId: "1:901866628883:web:bc9a466c22b77e74565ce6",
  measurementId: "G-KRSQ70BSJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;