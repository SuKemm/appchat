// ======================================================
// Chat Validator
// ======================================================

function createValidationError(message) {

    return new Error(message);

}


// ======================================================
// Conversation
// ======================================================

export function validateConversationId(
    conversationId,
) {

    if (
        typeof conversationId !== "string" ||
        conversationId.trim() === ""
    ) {

        throw createValidationError(
            "Conversation ID is required.",
        );

    }

    return conversationId;

}


// ======================================================
// Message
// ======================================================

export function validateMessageId(
    messageId,
) {

    if (
        typeof messageId !== "string" ||
        messageId.trim() === ""
    ) {

        throw createValidationError(
            "Message ID is required.",
        );

    }

    return messageId;

}


// ======================================================
// User
// ======================================================

export function validateUid(
    uid,
) {

    if (
        typeof uid !== "string" ||
        uid.trim() === ""
    ) {

        throw createValidationError(
            "User ID is required.",
        );

    }

    return uid;

}


export function validateUsers(
    sender,
    receiver,
) {

    validateUid(sender);

    validateUid(receiver);

}


// ======================================================
// Email
// ======================================================

export function validateEmail(
    email,
) {

    if (
        typeof email !== "string" ||
        email.trim() === ""
    ) {

        throw createValidationError(
            "Email is required.",
        );

    }

    return email;

}


// ======================================================
// Emoji
// ======================================================

export function validateEmoji(
    emoji,
) {

    if (
        typeof emoji !== "string" ||
        emoji.trim() === ""
    ) {

        throw createValidationError(
            "Emoji is required.",
        );

    }

    return emoji;

}


// ======================================================
// Message Type
// ======================================================

const MESSAGE_TYPES = [

    "text",

    "image",

    "file",

];


export function validateMessageType(
    type,
) {

    if (
        !MESSAGE_TYPES.includes(type)
    ) {

        throw createValidationError(
            `Unsupported message type: ${type}`,
        );

    }

    return type;

}


// ======================================================
// Payload
// ======================================================

export function validatePayload(
    payload,
) {

    if (
        payload == null ||
        typeof payload !== "object"
    ) {

        throw createValidationError(
            "Payload must be an object.",
        );

    }

    return payload;

}


// ======================================================
// Text
// ======================================================

export function validateText(
    text,
) {

    if (
        typeof text !== "string"
    ) {

        throw createValidationError(
            "Text must be a string.",
        );

    }

    return text.trim();

}


// ======================================================
// Reply
// ======================================================

export function validateReply(
    reply,
) {

    if (
        reply == null
    ) {

        return null;

    }


    if (
        typeof reply !== "object"
    ) {

        throw createValidationError(
            "Reply must be an object.",
        );

    }


    return reply;

}


// ======================================================
// Image
// ======================================================

export function validateImage(
    image,
) {

    if (
        !image
    ) {

        throw createValidationError(
            "Image is required.",
        );

    }


    if (
        !image.type ||
        !image.type.startsWith("image/")
    ) {

        throw createValidationError(
            "Invalid image file.",
        );

    }


    return image;

}


// ======================================================
// File
// ======================================================

export function validateFile(
    file,
) {

    if (
        !file
    ) {

        throw createValidationError(
            "File is required.",
        );

    }


    return file;

}