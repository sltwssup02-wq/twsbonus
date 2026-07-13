import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAN1TGGzWkNFO5QqdfFppBXsnlrzdjzuQA",
    authDomain: "bonus-result.firebaseapp.com",
    databaseURL: "https://bonus-result-default-rtdb.firebaseio.com/",
    projectId: "bonus-result",
    storageBucket: "bonus-result.firebasestorage.app",
    messagingSenderId: "1090545530627",
    appId: "1:1090545530627:web:ad812f7be0a3b4e1bc1b36",
    measurementId: "G-P0Y3BT9F8Z"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, push, onValue, remove };

export const DataModel = {
    databaseItems: [],
    irDatabaseItems: [],
    monthOrder: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    
    getUserRole: () => localStorage.getItem('userRole') || null,
    setUserRole: (role) => {
        if(role) localStorage.setItem('userRole', role);
        else localStorage.removeItem('userRole');
    }
};