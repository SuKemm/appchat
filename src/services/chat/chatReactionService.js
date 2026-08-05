import {
    deleteField,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import {
    getMessageDocument,
} from "./chatQueries";

import {
    validateConversationId,
    validateEmoji,
    validateMessageId,
    validateUid,
} from "./chatValidator";


// ======================================================
// Error
// ======================================================

function handleError(scope, error) {

    console.error(`[chatReactionService.${scope}]`, error);

    throw error;

}


// ======================================================
// Update Message
// ======================================================

async function updateMessageDocument(conversationId, messageId, data) {

    return updateDoc(
        getMessageDocument(conversationId, messageId),
        data,
    );

}


// ======================================================
// React To Message
// ======================================================
// Reactions are stored as a map keyed by uid (message.reactions =
// { [uid]: emoji }) so each user has at most one active reaction
// per message, and the UI can look up/toggle their own reaction
// directly via message.reactions?.[uid].

export async function reactMessage(conversationId, messageId, uid, emoji) {

    validateConversationId(conversationId);
    validateMessageId(messageId);
    validateUid(uid);
    validateEmoji(emoji);

    try {

        await updateMessageDocument(conversationId, messageId, {
            [`reactions.${uid}`]: emoji,
            updatedAt: serverTimestamp(),
        });

    } catch (error) {

        handleError("reactMessage", error);

    }

}


// ======================================================
// Remove Reaction
// ======================================================

export async function removeReaction(conversationId, messageId, uid) {

    validateConversationId(conversationId);
    validateMessageId(messageId);
    validateUid(uid);

    try {

        await updateMessageDocument(conversationId, messageId, {
            [`reactions.${uid}`]: deleteField(),
            updatedAt: serverTimestamp(),
        });

    } catch (error) {

        handleError("removeReaction", error);

    }

}


// ======================================================
// Toggle Reaction (alias)
// ======================================================

export async function toggleReaction(conversationId, messageId, uid, emoji) {

    return reactMessage(conversationId, messageId, uid, emoji);

}
