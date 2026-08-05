// ==========================================================
// FORMAT TIME
// ==========================================================

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



// ==========================================================
// FORMAT DATE
// ==========================================================

export function formatDate(timestamp) {

    if (!timestamp) {

        return "";

    }


    try {

        const date =
            timestamp?.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return date.toLocaleDateString(

            "vi-VN"

        );


    } catch {

        return "";

    }

}



// ==========================================================
// FORMAT FILE SIZE
// ==========================================================

export function formatFileSize(
    size = 0,
) {


    if (!size) {

        return "0 B";

    }


    if (size < 1024) {

        return `${size} B`;

    }


    if (size < 1024 * 1024) {

        return `${(size / 1024)

                .toFixed(1)

            } KB`;

    }


    if (size < 1024 * 1024 * 1024) {

        return `${(size / 1024 / 1024)

                .toFixed(2)

            } MB`;

    }


    return `${(size / 1024 / 1024 / 1024)

            .toFixed(2)

        } GB`;

}



// ==========================================================
// FILE NAME
// ==========================================================

export function getFileExtension(
    name = "",
) {

    return name

        .split(".")

        .pop()

        ?.toLowerCase()

        || "";

}



// ==========================================================
// TRUNCATE TEXT
// ==========================================================

export function truncateText(
    text = "",
    length = 50,
) {


    if (
        text.length <= length
    ) {

        return text;

    }


    return (

        text.substring(
            0,
            length,
        )
        + "..."

    );

}



// ==========================================================
// EMPTY CHECK
// ==========================================================

export function isEmpty(
    value,
) {

    return (

        value === null ||

        value === undefined ||

        value === ""

    );

}



// ==========================================================
// SAFE JSON
// ==========================================================

export function safeJsonParse(
    value,
) {

    try {

        return JSON.parse(
            value,
        );

    } catch {

        return null;

    }

}