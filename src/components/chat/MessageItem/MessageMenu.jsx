import { useEffect, useRef, useState } from "react";

import useEscapeToClose from "../../../hooks/useEscapeToClose";
import useEdgeClamp from "../../../hooks/useEdgeClamp";

import {
    ChevronRight,
    Copy,
    Forward,
    Info,
    ListChecks,
    MoreHorizontal,
    Pencil,
    Pin,
    PinOff,
    Reply,
    RotateCcw,
    Star,
    Trash2,
} from "lucide-react";

// Độ trễ mở/đóng submenu khi hover — giống Zalo: rê chuột qua là
// xổ ra ngay (trễ ngắn tránh nhấp nháy lúc lướt qua), còn đóng thì
// trễ lâu hơn một chút để có thời gian di chuột chéo từ nút trigger
// sang panel submenu mà không bị đóng giữa chừng.
const OPEN_DELAY = 80;
const CLOSE_DELAY = 220;

function MessageMenu({
    isMine,
    hasText,
    isRecalled,
    isPinned,
    isMarked,
    onReply,
    onCopy,
    onTogglePin,
    onToggleMark,
    onSelectMultiple,
    onViewDetails,
    onForward,
    onEdit,
    onRecall,
    onDeleteForMe,
    onDeleteForEveryone,
    onClose,
}) {

    useEscapeToClose(onClose);

    const [showMore, setShowMore] =
        useState(false);

    const openTimer = useRef(null);
    const closeTimer = useRef(null);

    const { ref, style, flipUp } =
        useEdgeClamp({ checkVertical: true });

    // Submenu là 1 panel tách riêng, xổ ra CẠNH BÊN trigger (đúng
    // kiểu Zalo) — dùng edge-clamp riêng để tự kéo lại nếu tràn khỏi
    // khung .messages, chỉ đo khi đang mở (auto=true nhưng submenu
    // chỉ mount lúc showMore=true nên không tốn listener khi đóng).
    const submenu =
        useEdgeClamp({ auto: true });

    useEffect(() => {

        return () => {

            clearTimeout(openTimer.current);
            clearTimeout(closeTimer.current);

        };

    }, []);

    function openSubmenu() {

        clearTimeout(closeTimer.current);

        openTimer.current =
            setTimeout(() => setShowMore(true), OPEN_DELAY);

    }

    function scheduleCloseSubmenu() {

        clearTimeout(openTimer.current);

        closeTimer.current =
            setTimeout(() => setShowMore(false), CLOSE_DELAY);

    }

    function toggleSubmenu() {

        clearTimeout(openTimer.current);
        clearTimeout(closeTimer.current);

        setShowMore((v) => !v);

    }

    const run = (fn) => () => {

        fn?.();
        onClose?.();

    };

    const hasMoreOptions =
        !isRecalled &&
        ((isMine && hasText) || isMine);

    // Flyout mở về phía CÒN NHIỀU CHỖ TRỐNG hơn — menu bên phải
    // (isMine, sát mép phải khung chat) thì xổ sang trái, menu bên
    // trái (sát mép trái) thì xổ sang phải, tránh tràn ra ngoài màn
    // hình ngay từ đầu thay vì chỉ trông chờ vào bù trừ shiftX.
    const submenuSide =
        isMine ? "side-left" : "side-right";

    return (

        <>

            <div
                className="message-menu-backdrop"
                onClick={onClose}
            />

            <div
                ref={ref}
                className={`message-menu-position ${isMine ? "align-right" : "align-left"} ${flipUp ? "flip-up" : ""}`}
                style={style}
            >

            <div className="message-menu">

                {!isRecalled && (

                    <button type="button" className="message-menu-item" onClick={run(onReply)}>
                        <Reply size={16} />
                        <span>Trả lời</span>
                    </button>

                )}

                {!isRecalled && (

                    <button type="button" className="message-menu-item" onClick={run(onForward)}>
                        <Forward size={16} />
                        <span>Chuyển tiếp</span>
                    </button>

                )}

                {hasText && !isRecalled && (

                    <button type="button" className="message-menu-item" onClick={run(onCopy)}>
                        <Copy size={16} />
                        <span>Copy tin nhắn</span>
                    </button>

                )}

                <button type="button" className="message-menu-item" onClick={run(onTogglePin)}>
                    {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                    <span>{isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}</span>
                </button>

                <button type="button" className="message-menu-item" onClick={run(onToggleMark)}>
                    <Star size={16} />
                    <span>{isMarked ? "Bỏ đánh dấu" : "Đánh dấu tin nhắn"}</span>
                </button>

                <button type="button" className="message-menu-item" onClick={run(onSelectMultiple)}>
                    <ListChecks size={16} />
                    <span>Chọn nhiều tin nhắn</span>
                </button>

                <button type="button" className="message-menu-item" onClick={run(onViewDetails)}>
                    <Info size={16} />
                    <span>Xem chi tiết</span>
                </button>

                {hasMoreOptions && (

                    <div
                        className="message-menu-more-wrapper"
                        onMouseEnter={openSubmenu}
                        onMouseLeave={scheduleCloseSubmenu}
                    >

                        <button
                            type="button"
                            className={`message-menu-item ${showMore ? "active" : ""}`}
                            onClick={toggleSubmenu}
                        >
                            <MoreHorizontal size={16} />
                            <span>Tuỳ chọn khác</span>
                            <ChevronRight size={14} className="message-menu-item-chevron" />
                        </button>

                        {showMore && (

                            <div
                                ref={submenu.ref}
                                className={`message-menu-submenu-flyout ${submenuSide}`}
                                style={submenu.style}
                            >

                                {isMine && !isRecalled && hasText && (

                                    <button type="button" className="message-menu-item" onClick={run(onEdit)}>
                                        <Pencil size={16} />
                                        <span>Chỉnh sửa</span>
                                    </button>

                                )}

                                {isMine && !isRecalled && (

                                    <button
                                        type="button"
                                        className="message-menu-item danger"
                                        onClick={run(onDeleteForEveryone)}
                                    >
                                        <Trash2 size={16} />
                                        <span>Xóa ở phía mọi người</span>
                                    </button>

                                )}

                            </div>

                        )}

                    </div>

                )}

                <div className="message-menu-divider" />

                {isMine && !isRecalled && (

                    <button type="button" className="message-menu-item danger" onClick={run(onRecall)}>
                        <RotateCcw size={16} />
                        <span>Thu hồi</span>
                    </button>

                )}

                <button
                    type="button"
                    className="message-menu-item danger"
                    onClick={run(onDeleteForMe)}
                >
                    <Trash2 size={16} />
                    <span>Xóa chỉ ở phía tôi</span>
                </button>

            </div>

            </div>

        </>

    );

}

export default MessageMenu;
