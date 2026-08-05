import {
    getConversation,
} from "./conversationService";

import {
    updateConversationData,
} from "./conversationUpdateService";

import {
    validateConversationId,
    validateUid,
} from "./conversationValidator";

// ======================================================
// Private Helpers
// ======================================================

function handleError(
    scope,
    error,
) {

    console.error(

        `[conversationMemberService.${scope}]`,

        error,

    );

    throw error;

}

function uniqueMembers(
    members,
) {

    return [

        ...new Set(
            members,
        ),

    ];

}

function removeUid(

    list,

    uid,

) {

    return list.filter(

        (item) => item !== uid,

    );

}

// ======================================================
// Add Members
// ======================================================

export async function addMembers(

    conversationId,

    memberIds,

) {

    validateConversationId(
        conversationId,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        const participants =
            uniqueMembers([

                ...conversation.participants,

                ...memberIds,

            ]);

        await updateConversationData(

            conversationId,

            {

                participants,

            },

        );

    } catch (error) {

        handleError(

            "addMembers",

            error,

        );

    }

}

// ======================================================
// Remove Member
// ======================================================

export async function removeMember(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            conversation.owner === uid

        ) {

            throw new Error(
                "Owner cannot be removed.",
            );

        }

        const participants =
            removeUid(

                conversation.participants,

                uid,

            );

        const admins =
            removeUid(

                conversation.admins,

                uid,

            );

        await updateConversationData(

            conversationId,

            {

                participants,

                admins,

            },

        );

    } catch (error) {

        handleError(

            "removeMember",

            error,

        );

    }

}

// ======================================================
// Block Member
// ======================================================

export async function blockMember(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            conversation.owner === uid

        ) {

            throw new Error(
                "Owner cannot be blocked.",
            );

        }

        const blockedMembers =
            uniqueMembers([

                ...(conversation.blockedMembers || []),

                uid,

            ]);

        // a blocked member loses admin rights while blocked
        const admins =
            removeUid(

                conversation.admins,

                uid,

            );

        await updateConversationData(

            conversationId,

            {

                blockedMembers,

                admins,

            },

        );

    } catch (error) {

        handleError(

            "blockMember",

            error,

        );

    }

}

// ======================================================
// Unblock Member
// ======================================================

export async function unblockMember(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        const blockedMembers =
            removeUid(

                conversation.blockedMembers || [],

                uid,

            );

        await updateConversationData(

            conversationId,

            {

                blockedMembers,

            },

        );

    } catch (error) {

        handleError(

            "unblockMember",

            error,

        );

    }

}

// ======================================================
// Leave Conversation
// ======================================================

export async function leaveConversation(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            conversation.owner === uid

        ) {

            throw new Error(
                "Owner must transfer ownership before leaving.",
            );

        }

        await removeMember(

            conversationId,

            uid,

        );

    } catch (error) {

        handleError(

            "leaveConversation",

            error,

        );

    }

}

// ======================================================
// Merge Groups
// ======================================================

export async function mergeGroups(

    targetConversationId,

    sourceConversationId,

    uid,

) {

    validateConversationId(
        targetConversationId,
    );

    validateConversationId(
        sourceConversationId,
    );

    validateUid(
        uid,
    );

    if (
        targetConversationId === sourceConversationId
    ) {

        throw new Error(
            "Cannot merge a group into itself.",
        );

    }

    try {

        const [target, source] = await Promise.all([

            getConversation(targetConversationId),

            getConversation(sourceConversationId),

        ]);

        if (
            target?.type !== "group" ||
            source?.type !== "group"
        ) {

            throw new Error(
                "Both conversations must be groups.",
            );

        }

        const canManageTarget =
            target.owner === uid ||
            target.admins?.includes(uid);

        const canManageSource =
            source.owner === uid ||
            source.admins?.includes(uid);

        if (
            !canManageTarget ||
            !canManageSource
        ) {

            throw new Error(
                "You must be an owner/admin of both groups to merge them.",
            );

        }

        const participants =
            uniqueMembers([

                ...(target.participants || []),

                ...(source.participants || []),

            ]);

        const admins =
            uniqueMembers([

                ...(target.admins || []),

                ...(source.admins || []),

            ]);

        const participantEmails =
            uniqueMembers([

                ...(target.participantEmails || []),

                ...(source.participantEmails || []),

            ]);

        await updateConversationData(

            targetConversationId,

            {

                participants,

                admins,

                participantEmails,

            },

        );

        // Soft-delete the source group so it disappears from lists,
        // its message history stays in Firestore but is no longer
        // reachable through the normal group queries.
        await updateConversationData(

            sourceConversationId,

            {

                isDeleted: true,

                mergedInto: targetConversationId,

            },

        );

        return getConversation(
            targetConversationId,
        );

    } catch (error) {

        handleError(

            "mergeGroups",

            error,

        );

    }

}

// ======================================================
// Add Admin
// ======================================================

export async function addAdmin(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            !conversation.participants.includes(
                uid,
            )

        ) {

            throw new Error(
                "User is not a participant.",
            );

        }

        const admins =
            uniqueMembers([

                ...conversation.admins,

                uid,

            ]);

        await updateConversationData(

            conversationId,

            {

                admins,

            },

        );

    } catch (error) {

        handleError(

            "addAdmin",

            error,

        );

    }

}

// ======================================================
// Remove Admin
// ======================================================

export async function removeAdmin(

    conversationId,

    uid,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        uid,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            conversation.owner === uid

        ) {

            throw new Error(
                "Owner cannot be removed from admins.",
            );

        }

        const admins =
            removeUid(

                conversation.admins,

                uid,

            );

        await updateConversationData(

            conversationId,

            {

                admins,

            },

        );

    } catch (error) {

        handleError(

            "removeAdmin",

            error,

        );

    }

}

// ======================================================
// Transfer Ownership
// ======================================================

export async function transferOwnership(

    conversationId,

    newOwner,

) {

    validateConversationId(
        conversationId,
    );

    validateUid(
        newOwner,
    );

    try {

        const conversation =
            await getConversation(
                conversationId,
            );

        if (

            !conversation.participants.includes(
                newOwner,
            )

        ) {

            throw new Error(
                "New owner must be a participant.",
            );

        }

        const admins =
            uniqueMembers([

                ...conversation.admins,

                newOwner,

            ]);

        await updateConversationData(

            conversationId,

            {

                owner: newOwner,

                admins,

            },

        );

    } catch (error) {

        handleError(

            "transferOwnership",

            error,

        );

    }

}