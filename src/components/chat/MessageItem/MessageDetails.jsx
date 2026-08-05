import { X } from "lucide-react";

import useEscapeToClose from "../../../hooks/useEscapeToClose";

function formatFull(value) {

    if (!value) {
        return "—";
    }

    const date =
        typeof value.toDate === "function"
            ? value.toDate()
            : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${hh}:${min} ${dd}/${mm}/${yyyy}`;

}

function MessageDetails({
    message,
    users = [],
    onClose,
}) {

    useEscapeToClose(onClose, Boolean(message));

    if (!message) {
        return null;
    }

    const seenNames =
        (message.seenBy || [])
            .map((uid) => {

                const found =
                    users.find((item) => item.uid === uid);

                return found?.displayName || found?.email || uid;

            });

    return (

        <div className="message-details-backdrop" onClick={onClose}>

            <div
                className="message-details-panel"
                onClick={(event) => event.stopPropagation()}
            >

                <div className="message-details-header">

                    <h4>Chi tiết tin nhắn</h4>

                    <button type="button" onClick={onClose}>
                        <X size={16} />
                    </button>

                </div>

                <div className="message-details-row">
                    <span>Gửi lúc</span>
                    <strong>{formatFull(message.createdAt)}</strong>
                </div>

                {message.edited && (

                    <div className="message-details-row">
                        <span>Đã chỉnh sửa</span>
                        <strong>{formatFull(message.editedAt)}</strong>
                    </div>

                )}

                {message.recalled && (

                    <div className="message-details-row">
                        <span>Đã thu hồi</span>
                        <strong>{formatFull(message.recalledAt)}</strong>
                    </div>

                )}

                <div className="message-details-row">
                    <span>Trạng thái</span>
                    <strong>
                        {seenNames.length > 0
                            ? `Đã xem bởi ${seenNames.join(", ")}`
                            : "Chưa xem"}
                    </strong>
                </div>

            </div>

        </div>

    );

}

export default MessageDetails;
