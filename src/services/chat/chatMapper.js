import {
    serverTimestamp,
} from "firebase/firestore";

// ======================================================
// Helpers
// ======================================================

function createTimestamp() {

    return serverTimestamp();

}

function cleanObject(
    object,
) {

    return Object.fromEntries(

        Object.entries(
            object,
        ).filter(

            ([, value]) =>

                value !== undefined,

        ),

    );

}

// ======================================================
// Text Message
// ======================================================

export function buildTextMessage({

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    text,

    reply = null,

}) {

    return buildMessage({

        type: "text",

        sender,

        senderEmail,

        receiver,

        receiverEmail,

        payload: {

            text,

        },

        reply,

    });

}

// ======================================================
// Image Message
// ======================================================

export function buildImageMessage({

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    image,

    reply = null,

}) {

    return buildMessage({

        type: "image",

        sender,

        senderEmail,

        receiver,

        receiverEmail,

        payload: {

            image,

        },

        reply,

    });

}

// ======================================================
// File Message
// ======================================================

export function buildFileMessage({

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    file,

    reply = null,

}) {

    return buildMessage({

        type: "file",

        sender,

        senderEmail,

        receiver,

        receiverEmail,

        payload: {

            file,

        },

        reply,

    });

}

// ======================================================
// Base Message
// ======================================================

export function buildMessage({

    type,

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    payload = {},

    reply = null,

}) {

    return cleanObject({

        type,

        sender,

        senderEmail,

        receiver,

        receiverEmail,

        text:

            payload.text ?? "",

        image:

            payload.image ?? null,

        file:

            payload.file ?? null,

        reply,

        reactions: {},

        edited: false,

        recalled: false,

        seen: false,

        createdAt:

            createTimestamp(),

        updatedAt:

            createTimestamp(),

    });

}

// ======================================================
// Seen
// ======================================================

export function buildSeenMessage() {

    return {

        seen: true,

        seenAt:

            createTimestamp(),

        updatedAt:

            createTimestamp(),

    };

}

// ======================================================
// Edited
// ======================================================

export function buildEditedMessage(
    text,
) {

    return {

        text,

        edited: true,

        updatedAt:

            createTimestamp(),

    };

}

// ======================================================
// Recall
// ======================================================

export function buildRecalledMessage() {

    return {

        recalled: true,

        text: "",

        image: null,

        file: null,

        updatedAt:

            createTimestamp(),

    };

}

// ======================================================
// Typing
// ======================================================

export function buildTyping(
    typing,
) {

    return {

        typing: Boolean(
            typing,
        ),

        updatedAt:

            createTimestamp(),

    };

}

// ======================================================
// Reaction
// ======================================================

export function buildReaction(

    reactions = {},

    uid,

    emoji,

) {

    return {

        ...reactions,

        [uid]: emoji,

    };

}

export function removeReaction(

    reactions = {},

    uid,

) {

    const next = {

        ...reactions,

    };

    delete next[uid];

    return next;

}

// ======================================================
// Message Mapper
// ======================================================

export function mapMessage(
    snapshot,
) {

    if (

        !snapshot.exists()

    ) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data(),

    };

}

export function mapMessageList(
    snapshot,
) {

    return snapshot.docs.map(

        (doc) => ({

            id: doc.id,

            ...doc.data(),

        }),

    );

}

// ======================================================
// Typing Mapper
// ======================================================

export function mapTypingList(
    snapshot,
) {

    return snapshot.docs.map(

        (doc) => ({

            id: doc.id,

            ...doc.data(),

        }),

    );

}