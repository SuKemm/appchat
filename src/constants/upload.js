// constants/upload.js

export const FILE_LIMITS = Object.freeze({
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,
    MAX_FILE_SIZE: 20 * 1024 * 1024,
    MAX_FILES: 5,
});
export const ACCEPTED_IMAGE_TYPES = Object.freeze([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export const ACCEPTED_FILE_TYPES = Object.freeze([
    "application/pdf",
]);

export const UPLOAD_STATUS = Object.freeze({
    IDLE: "idle",
    UPLOADING: "uploading",
    SUCCESS: "success",
    ERROR: "error",
});
export const FILE_EXTENSIONS = Object.freeze({
    PDF: ".pdf",
    JPG: ".jpg",
    PNG: ".png",
    WEBP: ".webp",
});