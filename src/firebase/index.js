import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDT76xam8yCu01w57ciw6k9WfkdXmW_IWk",
    authDomain: "appchat-65fab.firebaseapp.com",
    projectId: "appchat-65fab",
    storageBucket: "appchat-65fab.firebasestorage.app",
    databaseURL: "https://appchat-65fab-default-rtdb.asia-southeast1.firebasedatabase.app",
    messagingSenderId: "903551784276",
    appId: "1:903551784276:web:1847ffe34d86c48d1564c1",
    measurementId: "G-BNS09BDKY0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
export const functions = getFunctions(app, "asia-southeast1");

// Tự động kết nối Emulator khi chạy ở môi trường Local Development (Vite)
if (import.meta.env.DEV) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);

    // Bỏ qua reCAPTCHA khi test Phone Auth trên localhost
    auth.settings.appVerificationDisabledForTesting = true;
}