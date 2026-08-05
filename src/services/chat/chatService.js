import {
    addDoc,
    getDoc,
    onSnapshot,
} from "firebase/firestore";

import {
    buildTextMessage,
    buildImageMessage,
    buildFileMessage,
    mapMessage,
    mapMessageList,
} from "./chatMapper";

import {
    getMessageDocument,
    getMessagesCollection,
    getMessagesQuery,
} from "./chatQueries";

import {
    validateConversationId,
    validateMessageId,
    validateText,
    validateImage,
    validateFile,
} from "./chatValidator";

import {
    updateLastMessage,
} from "../conversation/conversationUpdateService";
import {
    buildLastMessage,
} from "../conversation/conversationMapper";
// ======================================================
// Error
// ======================================================

function handleError(

    scope,

    error,

) {

    console.error(

        `[chatService.${scope}]`,

        error,

    );

    throw error;

}
// ======================================================
// Direct Conversation Meta
// ======================================================
// Direct (1-1) conversations don't go through
// createDirectConversation(), they are created lazily on
// first message at a deterministic id. We tag them with
// type/participants here so they show up in the unified
// conversation list query, same as groups.

function buildDirectMeta({

    conversationId,

    isGroup,

    sender,

    receiver,

}) {

    if (isGroup || !sender || !receiver) {

        return {};

    }

    return {

        type: "direct",

        conversationKey: conversationId,

        participants: [
            sender,
            receiver,
        ],

    };

}

// ======================================================
// Create Message
// ======================================================

async function createMessageDocument(

    conversationId,

    message,

) {

    return addDoc(

        getMessagesCollection(
            conversationId,
        ),

        message,

    );

}

// ======================================================
// Subscribe Snapshot
// ======================================================

function subscribeSnapshot(

    source,

    mapper,

    onChange,

    onError,

) {

    return onSnapshot(

        source,

        (snapshot) => {

            onChange?.(

                mapper(
                    snapshot,
                ),

            );

        },

        onError,

    );

}
// ======================================================
// Get Message
// ======================================================

export async function getMessage(

    conversationId,

    messageId,

) {

    validateConversationId(
        conversationId,
    );

    validateMessageId(
        messageId,
    );

    try {

        const snapshot =
            await getDoc(

                getMessageDocument(

                    conversationId,

                    messageId,

                ),

            );

        return mapMessage(
            snapshot,
        );

    } catch (error) {

        handleError(

            "getMessage",

            error,

        );

    }

}
// ======================================================
// Subscribe Message
// ======================================================

export function subscribeMessage(

    conversationId,

    messageId,

    onChange,

    onError,

) {

    validateConversationId(
        conversationId,
    );

    validateMessageId(
        messageId,
    );

    return subscribeSnapshot(

        getMessageDocument(

            conversationId,

            messageId,

        ),

        mapMessage,

        onChange,

        onError,

    );

}
// ======================================================
// Subscribe Messages
// ======================================================

export function subscribeMessages(

    conversationId,

    onChange,

    onError,

) {

    validateConversationId(
        conversationId,
    );

    return subscribeSnapshot(

        getMessagesQuery(
            conversationId,
        ),

        mapMessageList,

        onChange,

        onError,

    );

}
// ======================================================
// Send Text Message
// ======================================================

export async function sendTextMessage({

    conversationId,

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    text,

    reply = null,

    isGroup = false,

}) {

    validateConversationId(
        conversationId,
    );

    validateText(
        text,
    );

    try {

        const message =
            buildTextMessage({

                sender,

                senderEmail,

                receiver,

                receiverEmail,

                text,

                reply,

            });

        const document =
            await createMessageDocument(

                conversationId,

                message,

            );

        await updateLastMessage(

            conversationId,

            {

                id: document.id,

                sender,

                type: "text",

                payload: {

                    text,

                },

                meta: buildDirectMeta({

                    conversationId,

                    isGroup,

                    sender,

                    receiver,

                }),

            },

        );

        return await getMessage(

            conversationId,

            document.id,

        );

    } catch (error) {

        handleError(

            "sendTextMessage",

            error,

        );

    }

}


// ======================================================
// Send Image Message
// ======================================================

export async function sendImageMessage({

    conversationId,

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    image,

    reply = null,

    isGroup = false,

}) {

    validateConversationId(
        conversationId,
    );

    validateImage(
        image,
    );

    try {

        const message =
            buildImageMessage({

                sender,

                senderEmail,

                receiver,

                receiverEmail,

                image,

                reply,

            });

        const document =
            await createMessageDocument(

                conversationId,

                message,

            );

        await updateLastMessage(

            conversationId,

            {

                id: document.id,

                sender,

                type: "image",

                meta: buildDirectMeta({

                    conversationId,

                    isGroup,

                    sender,

                    receiver,

                }),

            },

        );

        return await getMessage(

            conversationId,

            document.id,

        );

    } catch (error) {

        handleError(

            "sendImageMessage",

            error,

        );

    }

}
// ======================================================
// Send File Message
// ======================================================

export async function sendFileMessage({

    conversationId,

    sender,

    senderEmail,

    receiver,

    receiverEmail,

    file,

    reply = null,

    isGroup = false,

}) {

    validateConversationId(
        conversationId,
    );

    validateFile(
        file,
    );

    try {

        const message =
            buildFileMessage({

                sender,

                senderEmail,

                receiver,

                receiverEmail,

                file,

                reply,

            });

        const document =
            await createMessageDocument(

                conversationId,

                message,

            );

        await updateLastMessage(

            conversationId,

            {

                id: document.id,

                sender,

                type: "file",

                meta: buildDirectMeta({

                    conversationId,

                    isGroup,

                    sender,

                    receiver,

                }),

            },

        );

        return await getMessage(

            conversationId,

            document.id,

        );

    } catch (error) {

        handleError(

            "sendFileMessage",

            error,

        );

    }

}
// ======================================================
// Send Chat Message Alias
// ======================================================

export async function sendChatMessage(payload) {

    return sendTextMessage({

        conversationId:
            payload.conversationId,

        sender:
            payload.senderId ??
            payload.sender,

        senderEmail:
            payload.senderEmail ?? "",

        receiver:
            payload.receiverId ??
            payload.receiver,

        receiverEmail:
            payload.receiverEmail ?? "",

        text:
            payload.text,

        reply:
            payload.reply ?? null,

        isGroup:
            payload.isGroup ?? false,

    });

}