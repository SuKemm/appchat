import {
    ref,
} from "firebase/database";

import {
    realtimeDb,
} from "../../firebase";

// ======================================================
// Typing Reference
// ======================================================

export function getTypingRef(

    conversationId,

    uid,

) {

    return ref(

        realtimeDb,

        `typing/${conversationId}/${uid}`,

    );

}