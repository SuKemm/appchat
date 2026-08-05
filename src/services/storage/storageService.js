import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

import { storage } from "../../firebase";

// =========================
// Validate Image
// =========================

export function validateImage(file) {

    const allow = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];

    if (!allow.includes(file.type)) {

        return "Ảnh không hợp lệ.";

    }

    if (file.size > 5 * 1024 * 1024) {

        return "Ảnh tối đa 5MB.";

    }

    return null;

}

// =========================
// Upload Image
// =========================

export async function uploadImage(file) {

    const fileName =
        Date.now() + "_" + file.name;

    const storageRef = ref(
        storage,
        `images/${fileName}`
    );

    await uploadBytes(storageRef, file);

    return getDownloadURL(storageRef);

}

// =========================
// Upload File
// =========================

export function uploadFile(
    file,
    conversationId,
    onProgress
) {

    return new Promise((resolve, reject) => {

        const fileName =
            Date.now() + "_" + file.name;

        const storageRef = ref(
            storage,
            `files/${conversationId}/${fileName}`
        );

        const task =
            uploadBytesResumable(
                storageRef,
                file
            );

        task.on(

            "state_changed",

            (snapshot) => {

                const progress = Math.round(
                    snapshot.bytesTransferred /
                    snapshot.totalBytes *
                    100
                );

                onProgress?.(progress);

            },

            reject,

            async () => {

                const url =
                    await getDownloadURL(
                        task.snapshot.ref
                    );

                resolve({

                    url,

                    name: file.name,

                    size: file.size,

                    type: file.type,

                });

            }

        );

    });

}

import { deleteObject } from "firebase/storage";

export async function deleteFile(path) {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
}
