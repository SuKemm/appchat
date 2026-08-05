import { BellOff, Pin } from "lucide-react";

import Avatar from "../common/Avatar";

import { formatConversationTime } from "../../utils/time";

function GroupItem({
    group,
    active,
    user,
    onClick,
}) {

    const displayName =
        group.groupName || "Nhóm chưa đặt tên";

    const isPinned =
        Boolean(user?.uid) && (group.pinnedBy || []).includes(user.uid);

    const isMuted =
        Boolean(user?.uid) && (group.mutedBy || []).includes(user.uid);

    const lastMessage =
        group.lastMessage || null;

    const isOwnLastMessage =
        Boolean(user?.uid) && lastMessage?.sender === user.uid;

    const previewText =
        lastMessage
            ? `${isOwnLastMessage ? "Bạn: " : ""}${lastMessage.preview || ""}`
            : `${group.participantCount ?? group.participants?.length ?? 0} thành viên`;

    const timeText =
        formatConversationTime(
            lastMessage?.createdAt || group.updatedAt
        );

    return (

        <button
            type="button"
            className={
                active
                    ? "conversation active"
                    : "conversation"
            }
            onClick={onClick}
        >

            <Avatar
                text={displayName}
                src={group.groupAvatar}
                online={false}
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

                    <p className="conversation-preview">
                        {previewText}
                    </p>

                    {isMuted && (
                        <BellOff
                            size={14}
                            className="conversation-mute-icon"
                            aria-label="Đã tắt thông báo"
                        />
                    )}

                </div>

            </div>

        </button>

    );

}

export default GroupItem;
