import {
    arrayUnion,
    serverTimestamp,
    updateDoc,
    onSnapshot,
} from "firebase/firestore";


import {
    getMessageDocument,
    getMessagesQuery,
} from "./chatQueries";


import {
    validateConversationId,
    validateMessageId,
    validateUid,
} from "./chatValidator";


// ======================================================
// Error
// ======================================================

function handleError(

    scope,

    error,

) {

    console.error(

        `[chatReadService.${scope}]`,

        error,

    );

    throw error;

}


// ======================================================
// Update Message Document
// ======================================================

async function updateMessageDocument(

    conversationId,

    messageId,

    data,

) {

    return updateDoc(

        getMessageDocument(

            conversationId,

            messageId,

        ),

        data,

    );

}


// ======================================================
// Build Read Update
// ======================================================

export function buildReadUpdate({

    conversationId,

    messageId,

    uid,

}) {

    return {

        conversationId,

        messageId,

        uid,

        readAt: serverTimestamp(),

    };

}


// ======================================================
// Mark Message As Seen
// ======================================================

export async function markAsSeen(

    conversationId,

    messageId,

    uid,

) {


    validateConversationId(
        conversationId,
    );


    validateMessageId(
        messageId,
    );


    validateUid(
        uid,
    );


    try {


        await updateMessageDocument(

            conversationId,

            messageId,

            {

                seenBy:

                    arrayUnion(

                        uid,

                    ),

                updatedAt:

                    serverTimestamp(),

            },

        );


    } catch (error) {


        handleError(

            "markAsSeen",

            error,

        );


    }

}
// ======================================================
// Subscribe Messages
// ======================================================

export function subscribeMessages(

    conversationId,

    callback,

) {

    if (!conversationId) {

        return () => { };

    }


    return onSnapshot(

        getMessagesQuery(
            conversationId,
        ),

        (snapshot) => {

            const messages =
                snapshot.docs.map(

                    doc => ({

                        id: doc.id,

                        ...doc.data(),

                    })

                );


            callback(
                messages,
            );

        },

    );

}