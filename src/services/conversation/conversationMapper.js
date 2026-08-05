import {
    serverTimestamp,
} from "firebase/firestore";


// ======================================================
// Conversation Key
// ======================================================

export function buildConversationKey(
    participants = [],
) {

    return [...participants]
        .filter(Boolean)
        .sort()
        .join("_");

}


// ======================================================
// Last Message
// ======================================================

export function buildLastMessage({

    id = null,

    sender = null,

    type = "text",

    payload = {},

}) {

    let preview = "Message";


    switch (type) {

        case "text":

            preview = payload.text ?? "";

            break;


        case "image":

            preview = "🖼️ Hình ảnh";

            break;


        case "file":

            preview = "📎 Tệp tin";

            break;


        case "video":

            preview = "🎥 Video";

            break;


        case "audio":

            preview = "🎵 Âm thanh";

            break;


        case "sticker":

            preview = "😀 Nhãn dán";

            break;


        default:

            preview = "Tin nhắn";

    }


    return {

        id,

        sender,

        type,

        preview,

        createdAt: serverTimestamp(),

    };

}



// ======================================================
// Build Base Conversation
// ======================================================

export function buildConversation({

    type = "direct",

    conversationKey = null,

    participants = [],

    participantEmails = [],

    owner = null,

    admins = [],

    groupName = null,

    groupAvatar = null,

    description = "",

    lastMessage = null,

}) {


    return {


        type,


        conversationKey,


        participants,


        participantCount:
            participants.length,


        participantEmails,


        owner,


        admins,


        groupName,


        groupAvatar,


        description,


        lastMessage,


        createdBy:
            owner,


        updatedBy:
            owner,


        isArchived:
            false,


        isDeleted:
            false,


        createdAt:
            serverTimestamp(),


        updatedAt:
            serverTimestamp(),


    };

}



// ======================================================
// Direct Conversation
// ======================================================

export function buildDirectConversation({

    participants,

    participantEmails = [],

    owner,

}) {


    return buildConversation({

        type: "direct",

        conversationKey:
            buildConversationKey(
                participants,
            ),

        participants,

        participantEmails,

        owner,

        admins: [
            owner,
        ],

    });


}



// ======================================================
// Group Conversation
// ======================================================

export function buildGroupConversation({

    participants,

    participantEmails = [],

    owner,

    groupName,

    groupAvatar = null,

    description = "",

}) {


    return buildConversation({

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


}



// ======================================================
// Rename Group
// ======================================================

export function buildRenameGroup(

    groupName,

    updatedBy,

) {


    return {

        groupName,

        updatedBy,

        updatedAt:
            serverTimestamp(),

    };


}



// ======================================================
// Group Avatar
// ======================================================

export function buildGroupAvatar(

    groupAvatar,

    updatedBy,

) {


    return {

        groupAvatar,

        updatedBy,

        updatedAt:
            serverTimestamp(),

    };


}



// ======================================================
// Description
// ======================================================

export function buildDescription(

    description,

    updatedBy,

) {


    return {

        description,

        updatedBy,

        updatedAt:
            serverTimestamp(),

    };


}



// ======================================================
// Members
// ======================================================

export function buildMemberUpdate({

    participants,

    participantEmails = [],

    updatedBy,

}) {


    return {


        participants,


        participantEmails,


        participantCount:
            participants.length,


        updatedBy,


        updatedAt:
            serverTimestamp(),


    };


}



// ======================================================
// Archive
// ======================================================

export function buildArchiveConversation(

    archived,

    updatedBy,

) {


    return {


        isArchived:
            archived,


        updatedBy,


        updatedAt:
            serverTimestamp(),


    };


}



// ======================================================
// Delete
// ======================================================

export function buildDeleteConversation(

    deleted,

    updatedBy,

) {


    return {


        isDeleted:
            deleted,


        updatedBy,


        updatedAt:
            serverTimestamp(),


    };


}



// ======================================================
// Mapper
// ======================================================

export function mapConversation(
    snapshot,
) {


    if (!snapshot.exists()) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data(),

    };


}



// ======================================================
// Mapper List
// ======================================================

export function mapConversationList(
    snapshot,
) {


    return snapshot.docs.map(

        (doc) => ({

            id:
                doc.id,

            ...doc.data(),

        }),

    );


}



// ======================================================
// Members Mapper
// ======================================================

export function mapConversationMembers(
    snapshot,
) {


    return snapshot.docs.map(

        (doc) => ({

            id:
                doc.id,

            ...doc.data(),

        }),

    );


}