import {
    addDoc,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";

import {
    buildConversationKey,
    buildDirectConversation,
    buildGroupConversation,
    mapConversation,
    mapConversationList,
    mapConversationMembers,
} from "./conversationMapper";

import {
    getConversationByKeyQuery,
    getConversationDocument,
    getConversationsCollection,
    getConversationMembersQuery,
    getConversationsQuery,
    getDirectConversationsQuery,
    getGroupConversationsQuery,
} from "./conversationQueries";

import {
    validateConversation,
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

        `[conversationService.${scope}]`,

        error,

    );

    throw error;

}

async function getConversationByKey(
    conversationKey,
) {

    const snapshot = await getDocs(

        getConversationByKeyQuery(
            conversationKey,
        ),

    );

    if (
        snapshot.empty
    ) {

        return null;

    }

    return mapConversation(
        snapshot.docs[0],
    );

}

    function createConversationDocument(
        conversation,
    ) {

        return addDoc(

            getConversationsCollection(),

            conversation,

        );

    }

async function updateConversationDocument(

    conversationId,

    data,

) {

    return updateDoc(

        getConversationDocument(

            conversationId,

        ),

        data,

    );

}

// ======================================================
// Create Direct Conversation
// ======================================================

export async function createDirectConversation({

    participants,

    participantEmails = [],

    owner,

}) {

    validateConversation({

        type: "direct",

        participants,

        participantEmails,

        owner,

        admins: [

            owner,

        ],

    });

    try {

        const conversationKey =
            buildConversationKey(
                participants,
            );

        const existing =
            await getConversationByKey(
                conversationKey,
            );

        if (

            existing

        ) {

            return existing;

        }

        const conversation =
            buildDirectConversation({

                participants,

                participantEmails,

                owner,

            });

        const document =
            await createConversationDocument(

                conversation,

            );

        return getConversation(
            document.id,
        );

    } catch (error) {

        handleError(

            "createDirectConversation",

            error,

        );

    }

}

// ======================================================
// Create Group Conversation
// ======================================================

export async function createGroupConversation({

    participants,

    participantEmails = [],

    owner,

    groupName,

    groupAvatar = null,

    description = "",

}) {

    validateConversation({

        type: "group",

        participants,

        participantEmails,

        owner,

        admins: [

            owner,

        ],

        groupName,

        groupAvatar,

        description,

    });

    try {

        const conversation =
            buildGroupConversation({

                participants,

                participantEmails,

                owner,

                groupName,

                groupAvatar,

                description,

            });

        const document =
            await createConversationDocument(

                conversation,

            );

        return getConversation(
            document.id,
        );

    } catch (error) {

        handleError(

            "createGroupConversation",

            error,

        );

    }

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
// Get Conversation
// ======================================================
export async function getConversation(

    conversationId,

) {

    validateConversationId(
        conversationId,
    );

    try {

        const snapshot =
            await getDoc(

                getConversationDocument(
                    conversationId,
                ),

            );

        return mapConversation(
            snapshot,
        );

    } catch (error) {

        handleError(

            "getConversation",

            error,

        );

    }

}
// ======================================================
// Subscribe Conversation
// ======================================================
export function subscribeConversation(

    conversationId,

    onChange,

    onError,

) {

    validateConversationId(
        conversationId,
    );

    return subscribeSnapshot(

        getConversationDocument(
            conversationId,
        ),

        mapConversation,

        onChange,

        onError,

    );

}


// ======================================================
// Subscribe User Conversations
// ======================================================
export function subscribeConversations(

    uid,

    onChange,

    onError,

) {

    validateUid(
        uid,
    );

    return subscribeSnapshot(

        getConversationsQuery(
            uid,
        ),

        mapConversationList,

        onChange,

        onError,

    );

}


// ======================================================
// Subscribe Direct
// ======================================================
export function subscribeDirectConversations(

    uid,

    onChange,

    onError,

) {

    validateUid(
        uid,
    );

    return subscribeSnapshot(

        getDirectConversationsQuery(
            uid,
        ),

        mapConversationList,

        onChange,

        onError,

    );

}

// ======================================================
// Subscribe Group
// ======================================================
export function subscribeGroupConversations(

    uid,

    onChange,

    onError,

) {

    validateUid(
        uid,
    );

    return subscribeSnapshot(

        getGroupConversationsQuery(
            uid,
        ),

        mapConversationList,

        onChange,

        onError,

    );

}
// ======================================================
// Subscribe Members
// ======================================================
export function subscribeConversationMembers(

    conversationId,

    onChange,

    onError,

) {

    validateConversationId(
        conversationId,
    );

    return subscribeSnapshot(

        getConversationMembersQuery(
            conversationId,
        ),

        mapConversationMembers,

        onChange,

        onError,

    );

}