export const MESSAGE_TYPES = Object.freeze({
    TEXT: "text",
    IMAGE: "image",
    FILE: "file",
});

export const MESSAGE_STATUS = Object.freeze({
    SENDING: "sending",
    SENT: "sent",
    DELIVERED: "delivered",
    SEEN: "seen",
    FAILED: "failed",
});

export const MESSAGE_ACTIONS = Object.freeze({
    REPLY: "reply",
    EDIT: "edit",
    COPY: "copy",
    DELETE: "delete",
    RECALL: "recall",
});

export const MESSAGE_KEYS = Object.freeze({
    REPLY_TO: "replyTo",
    REACTIONS: "reactions",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
});

export const DEFAULT_MESSAGE = "Tin nhắn không khả dụng.";