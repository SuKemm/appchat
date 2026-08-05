import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
} from "firebase/storage";

import {
    storage,
} from "../../firebase";

import {
    validateImage,
    validateFile,
} from "./chatValidator";

// ======================================================
// Error
// ======================================================

function handleError(

    scope,

    error,

) {

    console.error(

        `[chatStorageService.${scope}]`,

        error,

    );

    throw error;

}

// ======================================================
// Upload
// ======================================================

async function upload(

    path,

    file,

) {

    const storageRef = ref(

        storage,

        path,

    );

    await uploadBytes(

        storageRef,

        file,

    );

    return {

        path,

        url: await getDownloadURL(

            storageRef,

        ),

    };

}

// ======================================================
// Upload Image
// ======================================================

export async function uploadImage({

    conversationId,

    image,

}) {

    validateImage(
        image,
    );

    try {

        const path =

            `chat-images/${conversationId}/${Date.now()}-${image.name}`;

        return upload(

            path,

            image,

        );

    } catch (error) {

        handleError(

            "uploadImage",

            error,

        );

    }

}

// ======================================================
// Upload File
// ======================================================

export async function uploadFile({

    conversationId,

    file,

}) {

    validateFile(
        file,
    );

    try {

        const path =

            `chat-files/${conversationId}/${Date.now()}-${file.name}`;

        return upload(

            path,

            file,

        );

    } catch (error) {

        handleError(

            "uploadFile",

            error,

        );

    }

}

// ======================================================
// Delete Storage File
// ======================================================

export async function deleteStorageFile(

    path,

) {

    try {

        await deleteObject(

            ref(

                storage,

                path,

            ),

        );

    } catch (error) {

        handleError(

            "deleteStorageFile",

            error,

        );

    }

}