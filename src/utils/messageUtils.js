import {
    File,
    FileArchive,
    FileText,
} from "lucide-react";

export function formatTime(timestamp) {

    if (!timestamp) {
        return "";
    }

    try {

        const date =
            timestamp?.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleTimeString(
            "vi-VN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    } catch {

        return "";

    }

}

export function formatFileSize(size = 0) {

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(2)} MB`;

}

export function getFileIcon(name = "") {

    const extension =
        name
            .split(".")
            .pop()
            ?.toLowerCase();

    switch (extension) {

        case "pdf":
        case "doc":
        case "docx":
            return <FileText size={30} />;

        case "zip":
        case "rar":
            return <FileArchive size={30} />;

        default:
            return <File size={30} />;

    }

}