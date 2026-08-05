// ======================================================
// Conversation
// ======================================================

export function validateConversationId(

    conversationId,

) {

    if (

        !conversationId ||

        typeof conversationId !== "string"

    ) {

        throw new Error(

            "Invalid conversationId.",

        );

    }

}

// ======================================================
// UID
// ======================================================

export function validateUid(

    uid,

) {

    if (

        !uid ||

        typeof uid !== "string"

    ) {

        throw new Error(

            "Invalid uid.",

        );

    }

}