import {
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import {
    buildDescription,
    buildGroupAvatar,
    buildLastMessage,
    buildRenameGroup,
} from "./conversationMapper";

import {
    getConversationDocument,
} from "./conversationQueries";

import {
    validateConversationId,
    validateDescription,
    validateGroupName,
} from "./conversationValidator";

// ======================================================
// Private Helpers
// ======================================================

function handleError(
    scope,
    error,
) {

    console.error(

        `[conversationUpdateService.${scope}]`,

        error,

    );

    throw error;

}

async function updateConversation(

    conversationId,

    data,

) {

    validateConversationId(
        conversationId,
    );

    return setDoc(

        getConversationDocument(
            conversationId,
        ),

        {

            ...data,

            updatedAt:
                serverTimestamp(),

        },

        {

            merge: true,

        },

    );

}

// ======================================================
// Rename Group
// ======================================================

export async function renameGroup(

    conversationId,

    groupName,

) {

    validateGroupName(
        groupName,
    );

    try {

        return updateConversation(

            conversationId,

            buildRenameGroup(
                groupName,
            ),

        );

    } catch (error) {

        handleError(

            "renameGroup",

            error,

        );

    }

}

// ======================================================
// Change Group Avatar
// ======================================================

export async function changeGroupAvatar(

    conversationId,

    groupAvatar,

) {

    try {

        return updateConversation(

            conversationId,

            buildGroupAvatar(
                groupAvatar,
            ),

        );

    } catch (error) {

        handleError(

            "changeGroupAvatar",

            error,

        );

    }

}

// ======================================================
// Change Description
// ======================================================

export async function changeGroupDescription(

    conversationId,

    description,

) {

    validateDescription(
        description,
    );

    try {

        return updateConversation(

            conversationId,

            buildDescription(
                description,
            ),

        );

    } catch (error) {

        handleError(

            "changeGroupDescription",

            error,

        );

    }

}

// ======================================================
// Set "Only Admins Can Send" Permission
// ======================================================
// When enabled, only the group owner (trưởng nhóm) and admins
// (phó nhóm) are allowed to send messages in the group. Regular
// members can still read the conversation. Enforced both here
// (UI) and in firestore.rules (security).

export async function setOnlyAdminsCanSend(

    conversationId,

    onlyAdminsCanSend,

) {

    try {

        return updateConversation(

            conversationId,

            {

                onlyAdminsCanSend: Boolean(
                    onlyAdminsCanSend,
                ),

            },

        );

    } catch (error) {

        handleError(

            "setOnlyAdminsCanSend",

            error,

        );

    }

}

// ======================================================
// Update Last Message
// ======================================================

export async function updateLastMessage(

    conversationId,

    {

        id,

        sender,

        type,

        payload,

        meta = {},

    },

) {

    try {

        return updateConversation(

            conversationId,

            {

                ...meta,

                lastMessage:
                    buildLastMessage({

                        id,

                        sender,

                        type,

                        payload,

                    }),

            },

        );

    } catch (error) {

        handleError(

            "updateLastMessage",

            error,

        );

    }

}

// ======================================================
// Generic Update
// ======================================================

export async function updateConversationData(

    conversationId,

    data,

) {

    try {

        return updateConversation(

            conversationId,

            data,

        );

    } catch (error) {

        handleError(

            "updateConversationData",

            error,

        );

    }

}