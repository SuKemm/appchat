import {
    ref,
} from "firebase/database";

import {
    realtimeDb,
} from "../../firebase";

// ======================================================
// Presence Reference
// ======================================================

export function getPresenceRef(
    uid,
) {

    return ref(

        realtimeDb,

        `status/${uid}`,

    );

}