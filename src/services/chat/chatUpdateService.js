import {
    arrayRemove,
    arrayUnion,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import {
    getMessageDocument,
} from "./chatQueries";

import {
    validateConversationId,
    validateMessageId,
    validateText,
    validateUid,
} from "./chatValidator";

// ======================================================
// Error
// ======================================================

function handleError(scope, error) {

    console.error(`[chatUpdateService.${scope}]`, error);

    throw error;

}


// ======================================================
// Edit Message
// ======================================================

export async function editMessage(conversationId, messageId, text) {

    validateConversationId(conversationId);
    validateMessageId(messageId);

    const trimmed = validateText(text);

    if (!trimmed) {
        return;
    }

    try {

        await updateDoc(
            getMessageDocument(conversationId, messageId),
            {
                text: trimmed,
                edited: true,
                editedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
        );

    } catch (error) {

        handleError("editMessage", error);

    }

}


// ======================================================
// Recall Message (unsend — hides content for everyone)
// ======================================================

export async function recallMessage(conversationId, messageId) {

    validateConversationId(conversationId);
    validateMessageId(messageId);

    try {

        await updateDoc(
            getMessageDocument(conversationId, messageId),
            {
                recalled: true,
                recalledAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
        );

    } catch (error) {

        handleError("recallMessage", error);

    }

}


// ======================================================
// Delete Message For Everyone (sender-only, shows a placeholder
// for all participants, same as recall but a distinct action)
// ======================================================

export async function deleteMessage(conversationId, messageId) {

    validateConversationId(conversationId);
    validateMessageId(messageId);

    try {

        await updateDoc(
            getMessageDocument(conversationId, messageId),
            {
                deleted: true,
                deletedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
        );

    } catch (error) {

        handleError("deleteMessage", error);

    }

}


// ======================================================
// Delete Message For Me Only
// ======================================================
// Adds the uid to the message's `deletedFor` array. The message
// stays intact for everyone else — MessageList filters it out
// client-side for anyone whose uid is in that array.

export async function deleteMessageForMe(conversationId, messageId, uid) {

    validateConversationId(conversationId);
    validateMessageId(messageId);
    validateUid(uid);

    try {

        await updateDoc(
            getMessageDocument(conversationId, messageId),
            {
                deletedFor: arrayUnion(uid),
            },
        );

    } catch (error) {

        handleError("deleteMessageForMe", error);

    }

}


// ======================================================
// Mark / Star Message (per-user)
// ======================================================

export async function toggleMarkMessage(conversationId, messageId, uid, marked) {

    validateConversationId(conversationId);
    validateMessageId(messageId);
    validateUid(uid);

    try {

        await updateDoc(
            getMessageDocument(conversationId, messageId),
            {
                markedBy: marked ? arrayUnion(uid) : arrayRemove(uid),
            },
        );

    } catch (error) {

        handleError("toggleMarkMessage", error);

    }

}


