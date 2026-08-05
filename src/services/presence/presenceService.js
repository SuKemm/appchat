import {
    onDisconnect,
    onValue,
    ref,
    serverTimestamp,
    set,
    update,
} from "firebase/database";


import {
    realtimeDb,
} from "../../firebase";


// ======================================================
// Error
// ======================================================

function handleError(
    scope,
    error,
) {

    console.error(

        `[presenceService.${scope}]`,

        error,

    );

    throw error;

}


// ======================================================
// Presence Reference
// ======================================================

function getPresenceRef(
    uid,
) {

    return ref(

        realtimeDb,

        `presence/${uid}`,

    );

}


// ======================================================
// Subscribe Presence
// ======================================================

export function subscribePresence(

    uid,

    onChange,

    onError,

) {


    if (!uid) {

        onChange?.({

            online: false,

            lastSeen: null,

        });


        return () => { };

    }


    return onValue(

        getPresenceRef(uid),

        (snapshot) => {


            if (!snapshot.exists()) {


                onChange?.({

                    online: false,

                    lastSeen: null,

                });


                return;

            }


            onChange?.(

                snapshot.val()

            );


        },

        onError,

    );


}



// ======================================================
// Set Online
// ======================================================

export async function setOnline(
    uid,
) {


    if (!uid) {

        return;

    }


    try {


        const presenceRef =
            getPresenceRef(uid);



        await set(

            presenceRef,

            {

                online: true,

                lastSeen:
                    serverTimestamp(),

            },

        );



        await onDisconnect(

            presenceRef,

        )
            .set({

                online: false,

                lastSeen:
                    serverTimestamp(),

            });



    } catch (error) {


        handleError(

            "setOnline",

            error,

        );


    }


}



// ======================================================
// Set Offline
// ======================================================

export async function setOffline(
    uid,
) {


    if (!uid) {

        return;

    }


    try {


        await set(

            getPresenceRef(uid),

            {

                online: false,

                lastSeen:
                    serverTimestamp(),

            },

        );


    } catch (error) {


        handleError(

            "setOffline",

            error,

        );


    }


}



// ======================================================
// Update Last Seen
// ======================================================

export async function updateLastSeen(
    uid,
) {


    if (!uid) {

        return;

    }


    try {


        await update(

            getPresenceRef(uid),

            {

                lastSeen:
                    serverTimestamp(),

            },

        );


    } catch (error) {


        handleError(

            "updateLastSeen",

            error,

        );


    }


}