import {
    File,
    FileArchive,
    FileText,
} from "lucide-react";

// ==========================================================
// FORMAT FILE SIZE
// ==========================================================

export function formatFileSize(
    size = 0,
) {

    if (size < 1024) {

        return `${size} B`;

    }


    if (size < 1024 * 1024) {

        return `${(
            size / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        size / 1024 / 1024
    ).toFixed(2)} MB`;

}
// ==========================================================
// FILE ICON
// ==========================================================

export function getFileIcon(
    type,
    name = "",
) {

    const ext =
        name
            .split(".")
            .pop()
            ?.toLowerCase();


    switch (ext) {


        case "pdf":

            return (
                <FileText size={30} />
            );


        case "doc":

        case "docx":

            return (
                <FileText size={30} />
            );


        case "zip":

        case "rar":

            return (
                <FileArchive size={30} />
            );


        default:

            return (
                <File size={30} />
            );

    }

}