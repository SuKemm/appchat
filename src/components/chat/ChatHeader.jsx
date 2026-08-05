import { ChevronLeft, MoreVertical, Pin, X } from "lucide-react";

import Avatar from "../common/Avatar";

function ChatHeader({
    selectedUser,
    otherTyping,
    onOpenConversationInfo,
    onBack,
    pinnedMessages = [],
    onUnpinMessage,
}) {

    if (!selectedUser) {
        return null;
    }

    const displayName =
        selectedUser.displayName ||
        selectedUser.email;

    const statusText = otherTyping
        ? "Đang nhập..."
        : selectedUser.isGroup
            ? selectedUser.email
            : selectedUser.online
                ? "Đang hoạt động"
                : "Ngoại tuyến";

    return (

        <header className="chat-header">

            <div className="chat-header-main">

                <button
                    type="button"
                    className="chat-header-back"
                    onClick={onBack}
                    title="Quay lại"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    type="button"
                    className="chat-header-left"
                    onClick={onOpenConversationInfo}
                >

                    <Avatar
                        text={displayName}
                        src={
                            selectedUser.isGroup
                                ? selectedUser.groupAvatar
                                : selectedUser.photoURL
                        }
                        online={selectedUser.online}
                    />

                    <div className="user-info">

                        <h3>
                            {displayName}
                        </h3>

                        <span>
                            {statusText}
                        </span>

                    </div>

                </button>

                <div className="chat-header-actions">

                    <button
                        type="button"
                        className="chat-header-action"
                        onClick={onOpenConversationInfo}
                        title="Xem thông tin hội thoại"
                    >
                        <MoreVertical size={20} />
                    </button>

                </div>

            </div>

            {/* Ghim tin nhắn — gộp chung 1 khối với header (kiểu Zalo:
                dòng "Tin nhắn đã ghim" nằm liền ngay dưới tên/avatar,
                cùng nền/viền với header) thay vì trôi nổi riêng trong
                khung tin nhắn như trước, để không bị "mất tích" phía
                sau thanh trạng thái khi cuộn. Hiện cho cả chat 1-1 lẫn
                chat nhóm — dữ liệu (`pinnedMessages`) do App.jsx tính
                sẵn từ `pinnedMessageIds` của hội thoại/nhóm đang mở. */}

            {pinnedMessages.length > 0 && (

                <div className="chat-header-pinned">

                    <Pin size={14} className="chat-header-pinned-icon" />

                    <span className="chat-header-pinned-text">
                        {pinnedMessages[0].text ||
                            (pinnedMessages[0].type === "image" ? "[Hình ảnh]" : "[Tệp đính kèm]")}
                    </span>

                    {pinnedMessages.length > 1 && (
                        <span className="chat-header-pinned-count">
                            +{pinnedMessages.length - 1}
                        </span>
                    )}

                    <button
                        type="button"
                        className="chat-header-pinned-close"
                        onClick={() => onUnpinMessage?.(pinnedMessages[0].id)}
                        title="Bỏ ghim"
                    >
                        <X size={14} />
                    </button>

                </div>

            )}

        </header>

    );

}

export default ChatHeader;
