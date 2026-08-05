import {
    arrayRemove,
} from "firebase/firestore";

import {
    updateConversationData,
} from "../conversation";

import {
    validateConversationId,
    validateMessageId,
} from "./chatValidator";

// ======================================================
// Error
// ======================================================

function handleError(scope, error) {

    console.error(`[chatPinService.${scope}]`, error);

    throw error;

}

// Zalo-style: keep a small, most-recent-first list of pinned
// message ids on the conversation doc. Capped so the banner /
// list doesn't grow unbounded.
const MAX_PINNED_MESSAGES = 5;

// ======================================================
// Pin Message
// ======================================================

export async function pinMessage(conversationId, messageId, currentPinnedIds = []) {

    validateConversationId(conversationId);
    validateMessageId(messageId);

    const withoutDuplicate =
        currentPinnedIds.filter((id) => id !== messageId);

    const next =
        [messageId, ...withoutDuplicate].slice(0, MAX_PINNED_MESSAGES);

    try {

        await updateConversationData(conversationId, {
            pinnedMessageIds: next,
        });

    } catch (error) {

        handleError("pinMessage", error);

    }

}

// ======================================================
// Unpin Message
// ======================================================

export async function unpinMessage(conversationId, messageId) {

    validateConversationId(conversationId);
    validateMessageId(messageId);

    try {

        await updateConversationData(conversationId, {
            pinnedMessageIds: arrayRemove(messageId),
        });

    } catch (error) {

        handleError("unpinMessage", error);

    }

}
