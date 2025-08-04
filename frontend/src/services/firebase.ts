import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxXZ9bzAA3cCzW9vxYN4Q9_ftOxLvj4bE",
  authDomain: "smartopdagent.firebaseapp.com",
  projectId: "smartopdagent",
  storageBucket: "smartopdagent.firebasestorage.app",
  messagingSenderId: "1098772598621",
  appId: "1:1098772598621:web:6800fc7196887f32fe62b4",
  measurementId: "G-Q31VQBTXZX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);