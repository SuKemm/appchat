import { Forward, MoreHorizontal, Reply } from "lucide-react";

import useEdgeClamp from "../../../hooks/useEdgeClamp";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function HoverToolbar({
    isMine,
    isRecalled = false,
    myReaction,
    onReact,
    onReply,
    onForward,
    onOpenMenu,
}) {

    // Thanh này luôn mount ở MỌI dòng tin (kể cả đang ẩn, chỉ hiện
    // khi hover) — nếu để hook tự đo lúc mount + gắn listener resize
    // như message-menu thì với đoạn chat dài sẽ tốn hàng trăm
    // listener cùng lúc. Vì vậy auto=false, chỉ đo lại đúng lúc
    // chuột thật sự hover vào (khi đó độ rộng khung .messages đã ổn
    // định, không cần theo dõi resize liên tục nữa).
    const actions =
        useEdgeClamp({ auto: false });

    const reactions =
        useEdgeClamp({ auto: false });

    const alignClass =
        isMine ? "align-right" : "align-left";

    return (

        <>

            {/* Cụm icon hành động (React nhanh / Trả lời / Chuyển tiếp /
                Thêm tuỳ chọn) — neo bên cạnh bong bóng, như cũ. */}
            <div
                ref={actions.ref}
                className={`hover-toolbar-position ${alignClass}`}
                style={actions.style}
                onMouseEnter={actions.recompute}
            >

                <div className="hover-toolbar">

                    {!isRecalled && (

                        <button
                            type="button"
                            className="hover-toolbar-more"
                            onClick={onReply}
                            title="Trả lời"
                        >
                            <Reply size={16} />
                        </button>

                    )}

                    {!isRecalled && (

                        <button
                            type="button"
                            className="hover-toolbar-more"
                            onClick={onForward}
                            title="Chuyển tiếp"
                        >
                            <Forward size={16} />
                        </button>

                    )}

                    <button
                        type="button"
                        className="hover-toolbar-more"
                        onClick={onOpenMenu}
                        title="Thêm tuỳ chọn"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                </div>

            </div>

            {/* Cụm emoji thả nhanh — tách riêng thành 1 khối độc lập,
                neo phía DƯỚI bong bóng (giống Zalo), không còn chung
                hàng với 2 nút hành động ở trên nữa. */}
            <div
                ref={reactions.ref}
                className={`hover-reactions-position ${alignClass}`}
                style={reactions.style}
                onMouseEnter={reactions.recompute}
            >

                <div className="hover-toolbar-emojis">

                    {QUICK_EMOJIS.map((emoji) => (

                        <button
                            key={emoji}
                            type="button"
                            className={
                                myReaction === emoji
                                    ? "hover-toolbar-emoji active"
                                    : "hover-toolbar-emoji"
                            }
                            onClick={() => onReact?.(emoji)}
                        >
                            {emoji}
                        </button>

                    ))}

                </div>

            </div>

        </>

    );

}

export default HoverToolbar;
