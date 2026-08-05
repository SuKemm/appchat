import {
    memo,
    useEffect,
    useRef,
    useState,
} from "react";

import MessageActionSheet from "../MessageActionSheet";
import MessageMenu from "./MessageMenu";
import HoverToolbar from "./HoverToolbar";
import MessageDetails from "./MessageDetails";
import PdfViewer from "../PdfViewer";
import Bubble from "./Bubble";

import {
    editMessage,
    recallMessage,
    deleteMessage,
    deleteMessageForMe,
    reactMessage,
    removeReaction,
    pinMessage,
    unpinMessage,
    toggleMarkMessage,
} from "../../../services/chat";

function MessageItem({
    message,
    currentUser,
    users = [],
    conversationId,
    setReplyMessage,
    pinnedMessageIds = [],
    selectionMode = false,
    selected = false,
    onToggleSelect,
    onEnterSelectionMode,
    onForward,
}) {

    const pressTimer =
        useRef(null);

    const [showSheet, setShowSheet] =
        useState(false);

    const [showMenu, setShowMenu] =
        useState(false);

    const [showDetails, setShowDetails] =
        useState(false);

    const [pdfUrl, setPdfUrl] =
        useState(null);

    const isMine =
        message.sender ===
        currentUser?.uid;

    const isRecalled =
        Boolean(message.recalled || message.deleted);

    const isPinned =
        pinnedMessageIds.includes(message.id);

    const isMarked =
        (message.markedBy || []).includes(currentUser?.uid);

    const myReaction =
        message.reactions?.[currentUser?.uid];

    const sender =
        users.find(
            (item) => item.uid === message.sender,
        );

    // Tên hiển thị của người gửi trên bubble (chat nhóm): ưu tiên
    // displayName tra được từ danh sách `users`, sau đó mới tới các
    // giá trị lưu kèm tin nhắn — KHÔNG hiện thẳng email đầy đủ như
    // trước (senderEmail) để tránh lộ email người dùng trong khung chat.
    const senderDisplayName =
        sender?.displayName ||
        message.senderName ||
        sender?.email ||
        message.senderEmail ||
        "Người dùng";

    const avatarSrc =
        isMine
            ? currentUser?.photoURL
            : sender?.photoURL;

    const avatar =
        (
            message.senderName ||
            message.senderEmail ||
            "U"
        )
            .charAt(0)
            .toUpperCase();

    useEffect(() => {

        return () => {

            clearTimeout(
                pressTimer.current
            );

        };

    }, []);

    async function handleEdit() {

        const text = prompt(
            "Chỉnh sửa tin nhắn",
            message.text
        );

        if (!text?.trim()) return;

        await editMessage(
            conversationId,
            message.id,
            text.trim()
        );

    }

    async function handleRecall() {

        if (
            !window.confirm(
                "Thu hồi tin nhắn?"
            )
        )
            return;

        await recallMessage(
            conversationId,
            message.id
        );

    }

    async function handleDeleteForMe() {

        if (
            !window.confirm(
                "Xóa tin nhắn này chỉ ở phía bạn? Người khác vẫn sẽ thấy tin nhắn."
            )
        )
            return;

        await deleteMessageForMe(
            conversationId,
            message.id,
            currentUser.uid,
        );

    }

    async function handleDeleteForEveryone() {

        if (
            !window.confirm(
                "Xóa tin nhắn này ở phía mọi người? Không thể hoàn tác."
            )
        )
            return;

        await deleteMessage(
            conversationId,
            message.id,
        );

    }

    async function handleReaction(emoji) {

        const current =
            message.reactions?.[currentUser.uid];

        if (current === emoji) {

            await removeReaction(
                conversationId,
                message.id,
                currentUser.uid
            );

        } else {

            await reactMessage(
                conversationId,
                message.id,
                currentUser.uid,
                emoji
            );

        }

    }

    async function handleTogglePin() {

        if (isPinned) {

            await unpinMessage(conversationId, message.id);

        } else {

            await pinMessage(conversationId, message.id, pinnedMessageIds);

        }

    }

    async function handleToggleMark() {

        await toggleMarkMessage(
            conversationId,
            message.id,
            currentUser.uid,
            !isMarked,
        );

    }

    function handleCopy() {

        navigator.clipboard.writeText(
            message.text || ""
        );

    }

    function handleOpenFile() {

        const ext =
            message.file?.name
                ?.split(".")
                ?.pop()
                ?.toLowerCase();

        if (
            ext === "pdf"
        ) {

            setPdfUrl(
                message.file.url
            );

            return;

        }

        window.open(
            message.file.url,
            "_blank"
        );

    }

    const sharedProps = {
        isMine,
        hasText: Boolean(message.text) && message.type === "text",
        isRecalled,
        isPinned,
        isMarked,
        myReaction,
        onReact: handleReaction,
        onReply: () => setReplyMessage(message),
        onCopy: handleCopy,
        onTogglePin: handleTogglePin,
        onToggleMark: handleToggleMark,
        onSelectMultiple: () => onEnterSelectionMode?.(message.id),
        onViewDetails: () => setShowDetails(true),
        onForward: () => onForward?.(message),
        onEdit: handleEdit,
        onRecall: handleRecall,
        onDeleteForMe: handleDeleteForMe,
        onDeleteForEveryone: handleDeleteForEveryone,
    };

    return (

        <>

            <div
                className={`message-row ${isMine ? "mine" : "other"} ${selected ? "selected" : ""} ${showMenu ? "menu-open" : ""}`}
                onContextMenu={(e) => {

                    if (selectionMode) return;

                    e.preventDefault();

                    setShowMenu(true);

                }}
                onClick={() => {

                    if (selectionMode) {
                        onToggleSelect?.(message.id);
                    }

                }}
                onTouchStart={() => {

                    if (selectionMode) return;

                    pressTimer.current =
                        setTimeout(() => {

                            setShowSheet(true);

                        }, 500);

                }}
                onTouchEnd={() => {

                    clearTimeout(
                        pressTimer.current
                    );

                }}
            >

                {selectionMode && (

                    <input
                        type="checkbox"
                        className="message-select-checkbox"
                        checked={selected}
                        readOnly
                    />

                )}

                {!isMine && (

                    <div className="message-avatar">

                        {avatarSrc ? (
                            <img src={avatarSrc} alt="" loading="lazy" decoding="async" />
                        ) : (
                            avatar
                        )}

                    </div>

                )}

                <div className="message-bubble-wrap">

                    <Bubble
                        message={message}
                        isMine={isMine}
                        senderDisplayName={senderDisplayName}
                        onOpenPdf={handleOpenFile}
                    />

                    {!selectionMode && !isRecalled && (

                        <HoverToolbar
                            isMine={isMine}
                            isRecalled={isRecalled}
                            myReaction={myReaction}
                            onReact={handleReaction}
                            onReply={() => setReplyMessage(message)}
                            onForward={() => onForward?.(message)}
                            onOpenMenu={() => setShowMenu(true)}
                        />

                    )}

                    {showMenu && (

                        <MessageMenu
                            {...sharedProps}
                            onClose={() => setShowMenu(false)}
                        />

                    )}

                </div>

                {/* Tin nhắn gửi đi (isMine) không hiển thị avatar — kiểu
                    Zalo: ẩn avatar người gửi ở bên phải để tối ưu không
                    gian, bubble căn sát lề phải màn hình. */}

            </div>

            <MessageActionSheet
                visible={showSheet}
                onClose={() => setShowSheet(false)}
                {...sharedProps}
            />

            {showDetails && (

                <MessageDetails
                    message={message}
                    users={users}
                    onClose={() => setShowDetails(false)}
                />

            )}

            <PdfViewer
                url={pdfUrl}
                onClose={() =>
                    setPdfUrl(null)
                }
            />

        </>

    );

}

export default memo(MessageItem);
