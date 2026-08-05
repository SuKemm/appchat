import {
    formatTime,
} from "../../../utils/utils";

function MessageMeta({
    message,
    isMine,
}) {

    return (

        <div
            className={`message-meta ${isMine
                    ? "mine"
                    : "other"
                }`}
        >

            {message.edited && (

                <span>

                    Đã chỉnh sửa •

                </span>

            )}

            {message.markedBy?.length > 0 && (

                <span className="marked-status" title="Đã đánh dấu">
                    ★
                </span>

            )}

            <span>

                {formatTime(
                    message.createdAt
                )}

            </span>

            {isMine &&
                message.seenBy?.length > 0 && (

                    <span className="seen-status">

                        • Đã xem

                    </span>

                )}

        </div>

    );

}

export default MessageMeta;