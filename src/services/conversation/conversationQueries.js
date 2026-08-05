import {
    collection,
    doc,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import { db } from "../../firebase";

// ======================================================
// Collections
// ======================================================

export function getConversationsCollection() {

    return collection(

        db,

        "conversations",

    );

}

export function getConversationMembersCollection(

    conversationId,

) {

    return collection(

        db,

        "conversations",

        conversationId,

        "members",

    );

}

// ======================================================
// Documents
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

export function getConversationMemberDocument(

    conversationId,

    uid,

) {

    return doc(

        db,

        "conversations",

        conversationId,

        "members",

        uid,

    );

}

// ======================================================
// User Conversations
// ======================================================

export function getConversationsQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "participants",

            "array-contains",

            uid,

        ),

        orderBy(

            "updatedAt",

            "desc",

        ),

    );

}

// ======================================================
// Direct Conversations
// ======================================================

export function getDirectConversationsQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "participants",

            "array-contains",

            uid,

        ),

        where(

            "type",

            "==",

            "direct",

        ),

        orderBy(

            "updatedAt",

            "desc",

        ),

    );

}

// ======================================================
// Group Conversations
// ======================================================

export function getGroupConversationsQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "participants",

            "array-contains",

            uid,

        ),

        where(

            "type",

            "==",

            "group",

        ),

        orderBy(

            "updatedAt",

            "desc",

        ),

    );

}

// ======================================================
// Owned Groups
// ======================================================

export function getOwnedGroupsQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "owner",

            "==",

            uid,

        ),

        where(

            "type",

            "==",

            "group",

        ),

        orderBy(

            "updatedAt",

            "desc",

        ),

    );

}

// ======================================================
// Admin Groups
// ======================================================

export function getAdminGroupsQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "admins",

            "array-contains",

            uid,

        ),

        where(

            "type",

            "==",

            "group",

        ),

        orderBy(

            "updatedAt",

            "desc",

        ),

    );

}

// ======================================================
// Conversation Key Lookup
// ======================================================

export function getConversationByKeyQuery(

    conversationKey,

) {

    return query(

        getConversationsCollection(),

        where(

            "conversationKey",

            "==",

            conversationKey,

        ),

    );

}

// ======================================================
// Direct Conversation Lookup
// ======================================================

export function getDirectConversationLookupQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "type",

            "==",

            "direct",

        ),

        where(

            "participants",

            "array-contains",

            uid,

        ),

    );

}

// ======================================================
// Conversation Members
// ======================================================

export function getConversationMembersQuery(

    conversationId,

) {

    return query(

        getConversationMembersCollection(

            conversationId,

        ),

        orderBy(

            "joinedAt",

            "asc",

        ),

    );

}

// ======================================================
// Conversation Owner
// ======================================================

export function getConversationOwnerQuery(

    uid,

) {

    return query(

        getConversationsCollection(),

        where(

            "owner",

            "==",

            uid,

        ),

    );

}