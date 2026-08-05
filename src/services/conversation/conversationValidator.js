// ======================================================
// Error
// ======================================================

function throwError(
    field,
) {

    throw new Error(
        `${field} is invalid`
    );

}


// ======================================================
// Conversation ID
// ======================================================

export function validateConversationId(
    conversationId,
) {

    if (
        !conversationId ||
        typeof conversationId !== "string"
    ) {

        throwError(
            "conversationId"
        );

    }

}


// ======================================================
// User ID
// ======================================================

export function validateUid(
    uid,
) {

    if (
        !uid ||
        typeof uid !== "string"
    ) {

        throwError(
            "uid"
        );

    }

}


// ======================================================
// Participants
// ======================================================

export function validateParticipants(
    participants,
) {

    if (
        !Array.isArray(participants) ||
        participants.length < 2
    ) {

        throwError(
            "participants"
        );

    }

}


// ======================================================
// Group Name
// ======================================================

export function validateGroupName(
    groupName,
) {

    if (
        !groupName ||
        typeof groupName !== "string"
    ) {

        throwError(
            "groupName"
        );

    }

}


// ======================================================
// Group Avatar
// ======================================================

export function validateGroupAvatar(
    groupAvatar,
) {

    if (
        groupAvatar == null
    ) {

        return;

    }


    if (
        typeof groupAvatar !== "string"
    ) {

        throwError(
            "groupAvatar"
        );

    }

}


// ======================================================
// Description
// ======================================================

export function validateDescription(
    description,
) {

    if (
        description == null
    ) {

        return;

    }


    if (
        typeof description !== "string"
    ) {

        throwError(
            "description"
        );

    }

}


// ======================================================
// Owner
// ======================================================

export function validateOwner(
    owner,
) {

    validateUid(
        owner
    );

}


// ======================================================
// Admins
// ======================================================

export function validateAdmins(
    admins,
) {

    if (
        !Array.isArray(admins)
    ) {

        throwError(
            "admins"
        );

    }

}


// ======================================================
// Conversation (composite)
// ======================================================

export function validateConversation({

    type,

    participants,

    owner,

    admins = [],

    groupName = null,

    groupAvatar = null,

    description = "",

}) {

    validateParticipants(
        participants
    );

    validateOwner(
        owner
    );

    validateAdmins(
        admins
    );

    if (
        type === "group"
    ) {

        validateGroupName(
            groupName
        );

        validateGroupAvatar(
            groupAvatar
        );

        validateDescription(
            description
        );

    }

}