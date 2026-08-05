import { memo } from "react";

import { BellOff, Pin } from "lucide-react";

import Avatar from "../common/Avatar";

import { formatConversationTime } from "../../utils/time";

function ConversationItem({
    item,
    currentUser,
    usersById,
    active,
    unreadCount = 0,
    onSelect,
}) {

    const isGroup =
        item.isGroup;

    const conversation =
        item.conversation;

    const hasConversation =
        Boolean(conversation);

    // =========================
    // Identity
    // =========================

    const displayName =
        isGroup
            ? (conversation?.groupName || "Nhóm chưa đặt tên")
            : (item.otherUser?.displayName || item.otherUser?.email || "Người dùng");

    const avatarSrc =
        isGroup
            ? conversation?.groupAvatar
            : item.otherUser?.photoURL;

    const isOnline =
        !isGroup && Boolean(item.otherUser?.online);

    // =========================
    // Group meta
    // =========================

    const isPinned =
        isGroup &&
        Boolean(currentUser?.uid) &&
        (conversation.pinnedBy || []).includes(currentUser.uid);

    const isMuted =
        isGroup &&
        Boolean(currentUser?.uid) &&
        (conversation.mutedBy || []).includes(currentUser.uid);

    const memberCount =
        isGroup
            ? (conversation?.participantCount ?? conversation?.participants?.length ?? 0)
            : 0;

    // =========================
    // Last message preview
    // =========================

    const lastMessage =
        conversation?.lastMessage || null;

    const isOwnLastMessage =
        Boolean(currentUser?.uid) && lastMessage?.sender === currentUser.uid;

    const lastSenderName =
        isGroup && lastMessage && !isOwnLastMessage
            ? (usersById?.get(lastMessage.sender)?.displayName ||
                usersById?.get(lastMessage.sender)?.email ||
                "")
            : "";

    let previewText;

    if (lastMessage) {

        const senderPrefix =
            isOwnLastMessage
                ? "Bạn: "
                : (lastSenderName ? `${lastSenderName}: ` : "");

        previewText = `${senderPrefix}${lastMessage.preview || ""}`;

    } else if (isGroup) {

        previewText = `${memberCount} thành viên`;

    } else if (hasConversation) {

        previewText = "";

    } else {

        previewText = "Bắt đầu trò chuyện";

    }

    const timeText =
        formatConversationTime(
            lastMessage?.createdAt || conversation?.updatedAt,
        );

    const showBadge =
        unreadCount > 0;

    return (

        <button
            type="button"
            className={
                active
                    ? "conversation active"
                    : "conversation"
            }
            onClick={() => onSelect(item)}
        >

            <Avatar
                text={displayName}
                src={avatarSrc}
                online={isOnline}
                isGroup={isGroup}
            />

            <div className="conversation-text">

                <div className="conversation-row">

                    <strong className="conversation-name">

                        {isPinned && (

                            <Pin
                                size={12}
                                className="conversation-pin-icon"
                                aria-label="Đã ghim"
                            />

                        )}

                        {displayName}

                    </strong>

                    {timeText && (

                        <span className="conversation-time">
                            {timeText}
                        </span>

                    )}

                </div>

                <div className="conversation-row">

                    <p
                        className={
                            !hasConversation
                                ? "conversation-preview conversation-preview-muted"
                                : "conversation-preview"
                        }
                    >
                        {previewText}
                    </p>

                    {isMuted && (

                        <BellOff
                            size={14}
                            className="conversation-mute-icon"
                            aria-label="Đã tắt thông báo"
                        />

                    )}

                    {showBadge && (

                        <span className="conversation-badge">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>

                    )}

                </div>

            </div>

        </button>

    );

}

export default memo(ConversationItem);
