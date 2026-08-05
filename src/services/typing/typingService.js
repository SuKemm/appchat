import {

    onDisconnect,
    onValue,
    remove,
    set,

} from "firebase/database";

import {

    getTypingRef,

} from "./typingQueries";

import {

    validateConversationId,
    validateUid,

} from "./typingValidator";

// ======================================================
// Error
// ======================================================

function handleError(

    scope,

    error,

) {

    console.error(

        `[typingService.${scope}]`,

        error,

    );

    throw error;

}

// ======================================================
// Subscribe Typing
// ======================================================

export function subscribeTyping(

    conversationId,

    uid,

    onChange,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    return onValue(

        getTypingRef(

            conversationId,

            uid,

        ),

        (snapshot) => {

            onChange?.(

                snapshot.exists(),

            );

        },

    );

}

// ======================================================
// Start Typing
// ======================================================

export async function startTyping(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const typingRef =
            getTypingRef(

                conversationId,

                uid,

            );

        await set(

            typingRef,

            true,

        );

        await onDisconnect(

            typingRef,

        ).remove();

    }

    catch (error) {

        handleError(

            "startTyping",

            error,

        );

    }

}

// ======================================================
// Stop Typing
// ======================================================

export async function stopTyping(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        await remove(

            getTypingRef(

                conversationId,

                uid,

            ),

        );

    }

    catch (error) {

        handleError(

            "stopTyping",

            error,

        );

    }

}