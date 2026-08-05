import {
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

import {

    fromFirestoreUser,

    toFirestoreUser,

} from "./usersMapper";

import {

    getUserDocument,

    getUsersQuery,

} from "./usersQueries";

// =========================
// SAVE USER
// =========================

export async function saveUser(user) {

    if (!user?.uid) {

        throw new Error("Invalid user.");

    }

    try {

        await setDoc(

            getUserDocument(user.uid),

            {

                ...toFirestoreUser(user),

                online: true,

                lastSeen: serverTimestamp(),

                updatedAt: serverTimestamp(),

            },

            {

                merge: true,

            },

        );

    } catch (error) {

        console.error(

            "Failed to save user:",

            error,

        );

        throw error;

    }

}

// =========================
// UPDATE USER STATUS
// =========================

export async function updateUserStatus(
    uid,
    online,
) {

    if (!uid) {

        throw new Error("Invalid uid.");

    }

    try {

        await updateDoc(

            getUserDocument(uid),

            {

                online,

                lastSeen: serverTimestamp(),

                updatedAt: serverTimestamp(),

            },

        );

    } catch (error) {

        console.error(

            "Failed to update user status:",

            error,

        );

        throw error;

    }

}

// =========================
// UPDATE PROFILE (name / avatar)
// =========================

export async function updateUserProfile(
    uid,
    {
        displayName,
        photoURL,
    } = {},
) {

    if (!uid) {

        throw new Error("Invalid uid.");

    }

    const data = {

        updatedAt: serverTimestamp(),

    };

    if (displayName !== undefined) {

        data.displayName = displayName;

    }

    if (photoURL !== undefined) {

        data.photoURL = photoURL;

    }

    try {

        await setDoc(

            getUserDocument(uid),

            data,

            {

                merge: true,

            },

        );

    } catch (error) {

        console.error(

            "Failed to update user profile:",

            error,

        );

        throw error;

    }

}

// =========================
// SUBSCRIBE USERS
// =========================

export function subscribeUsers(
    currentUid,
    callback,
    onError,
) {

    return onSnapshot(

        getUsersQuery(),

        (snapshot) => {

            const users = snapshot.docs

                .map(fromFirestoreUser)

                .filter(

                    (user) =>

                        user.uid !== currentUid,

                );

            callback?.(

                users,

            );

        },

        onError,

    );

}