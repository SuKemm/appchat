import {
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

import {
    auth,
} from "../../firebase";

// =========================
// AUTH LISTENER
// =========================

export function subscribeAuth(
    callback,
) {

    return onAuthStateChanged(
        auth,
        callback,
    );

}

// =========================
// LOGOUT
// =========================

export async function logout() {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Failed to logout:",
            error,
        );

        throw error;

    }

}