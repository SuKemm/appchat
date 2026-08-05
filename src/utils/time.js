export function formatLastSeen(lastSeen) {

    if (!lastSeen) {

        return "Offline";

    }

    const date =
        lastSeen?.toDate
            ? lastSeen.toDate()
            : new Date(lastSeen);

    const now = new Date();

    const diff =
        Math.floor(
            (now - date) / 1000
        );

    if (diff < 60) {

        return "Vừa hoạt động";

    }

    if (diff < 3600) {

        return `Hoạt động ${Math.floor(diff / 60)} phút trước`;

    }

    if (diff < 86400) {

        return `Hoạt động ${Math.floor(diff / 3600)} giờ trước`;

    }

    return (
        "Hoạt động " +
        date.toLocaleDateString("vi-VN") +
        " " +
        date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );

}

// ==========================================================
// SHORT RELATIVE TIME (dùng cho danh sách hội thoại, kiểu Zalo)
// ==========================================================

export function formatConversationTime(timestamp) {

    if (!timestamp) {

        return "";

    }

    let date;

    try {

        date =
            timestamp?.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        if (Number.isNaN(date.getTime())) {

            return "";

        }

    } catch {

        return "";

    }

    const now = new Date();

    const diffSeconds =
        Math.floor((now - date) / 1000);

    if (diffSeconds < 60) {

        return "Vừa xong";

    }

    if (diffSeconds < 3600) {

        return `${Math.floor(diffSeconds / 60)} phút`;

    }

    if (diffSeconds < 86400) {

        return `${Math.floor(diffSeconds / 3600)} giờ`;

    }

    const startOfToday =
        new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfDate =
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const dayDiff =
        Math.round((startOfToday - startOfDate) / 86400000);

    if (dayDiff === 1) {

        return "Hôm qua";

    }

    if (dayDiff < 7) {

        return `${dayDiff} ngày`;

    }

    return date.toLocaleDateString("vi-VN", {

        day: "2-digit",
        month: "2-digit",

    });

}