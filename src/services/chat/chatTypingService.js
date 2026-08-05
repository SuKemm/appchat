import {
    serverTimestamp,
    setDoc,
} from "firebase/firestore";


import {
    getTypingDocument,
} from "./chatQueries";


import {
    validateConversationId,
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

        `[chatTypingService.${scope}]`,

        error,

    );

    throw error;

}



// ======================================================
// Update Typing
// ======================================================

export async function updateTyping({

    conversationId,

    uid,

    typing = false,

}) {


    validateConversationId(

        conversationId,

    );


    validateUid(

        uid,

    );


    try {


        await setDoc(

            getTypingDocument(

                conversationId,

                uid,

            ),

            {

                uid,

                typing,

                updatedAt:

                    serverTimestamp(),

            },

            {

                merge: true,

            },

        );


    } catch (error) {


        handleError(

            "updateTyping",

            error,

        );


    }

}