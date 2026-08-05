import "../../styles/messageActionSheet.css";

import useEscapeToClose from "../../hooks/useEscapeToClose";

function MessageActionSheet({
    visible,
    onClose,
    isMine,
    hasText = true,
    isRecalled = false,
    isPinned = false,
    isMarked = false,
    onReply,
    onCopy,
    onEdit,
    onRecall,
    onDeleteForMe,
    onDeleteForEveryone,
    onForward,
    onReact,
    onTogglePin,
    onToggleMark,
    onSelectMultiple,
    onViewDetails,
}) {

    useEscapeToClose(onClose, visible);

    if (!visible) return null;

    const reactions = [
        "👍",
        "❤️",
        "😂",
        "😮",
        "😢",
        "😡",
    ];

    const run = (fn) => () => {
        fn?.();
        onClose();
    };

    return (

        <div
            className="sheet-overlay"
            onClick={onClose}
        >

            <div
                className="message-sheet"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="emoji-row">

                    {reactions.map((emoji) => (

                        <button
                            key={emoji}
                            className="reaction-btn"
                            onClick={() => {

                                onReact(emoji);

                                onClose();

                            }}
                        >

                            {emoji}

                        </button>

                    ))}

                </div>

                <button onClick={run(onReply)}>
                    Trả lời
                </button>

                {hasText && !isRecalled && (

                    <button onClick={run(onCopy)}>
                        Copy tin nhắn
                    </button>

                )}

                {!isRecalled && (

                    <button onClick={run(onForward)}>
                        Chuyển tiếp
                    </button>

                )}

                <button onClick={run(onTogglePin)}>
                    {isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                </button>

                <button onClick={run(onToggleMark)}>
                    {isMarked ? "Bỏ đánh dấu" : "Đánh dấu tin nhắn"}
                </button>

                <button onClick={run(onSelectMultiple)}>
                    Chọn nhiều tin nhắn
                </button>

                <button onClick={run(onViewDetails)}>
                    Xem chi tiết
                </button>

                {isMine && !isRecalled && hasText && (

                    <button onClick={run(onEdit)}>
                        Chỉnh sửa
                    </button>

                )}

                {isMine && !isRecalled && (

                    <button className="danger" onClick={run(onRecall)}>
                        Thu hồi
                    </button>

                )}

                {isMine && !isRecalled && (

                    <button className="danger" onClick={run(onDeleteForEveryone)}>
                        Xóa ở phía mọi người
                    </button>

                )}

                <button
                    className="danger"
                    onClick={run(onDeleteForMe)}
                >
                    Xóa chỉ ở phía tôi
                </button>

            </div>

        </div>

    );

}

export default MessageActionSheet;
