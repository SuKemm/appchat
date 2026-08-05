// =========================
// TO FIRESTORE
// =========================

export function toFirestoreUser(user) {

    return {

        uid: user.uid,

        email: user.email || "",

        phoneNumber: user.phoneNumber || "",

        displayName:

            user.displayName ||

            user.email?.split("@")[0] ||

            user.phoneNumber ||

            "User",

        photoURL:

            user.photoURL || null,

    };

}

// =========================
// FROM FIRESTORE
// =========================

export function fromFirestoreUser(document) {

    return {

        id: document.id,

        ...document.data(),

    };

}