import {
    collection,
    doc,
    orderBy,
    query,
} from "firebase/firestore";

import { db } from "../../firebase";

// ======================================================
// Collection
// ======================================================

export function getConversationsCollection() {

    return collection(

        db,

        "conversations",

    );

}

// ======================================================
// Conversation
// ======================================================

export function getConversationDocument(
    conversationId,
) {

    return doc(

        db,

        "conversations",

        conversationId,

    );

}

// ======================================================
// Messages
// ======================================================

export function getMessagesCollection(
    conversationId,
) {

    return collection(

        db,

        "conversations",

        conversationId,

        "messages",

    );

}

export function getMessageDocument(

    conversationId,

    messageId,

) {

    return doc(

        db,

        "conversations",

        conversationId,

        "messages",

        messageId,

    );

}

export function getMessagesQuery(
    conversationId,
) {

    return query(

        getMessagesCollection(
            conversationId,
        ),

        orderBy(

            "createdAt",

            "asc",

        ),

    );

}

// ======================================================
// Typing
// ======================================================

export function getTypingCollection(
    conversationId,
) {

    return collection(

        db,

        "conversations",

        conversationId,

        "typing",

    );

}

export function getTypingDocument(

    conversationId,

    uid,

) {

    return doc(

        db,

        "conversations",

        conversationId,

        "typing",

        uid,

    );

}