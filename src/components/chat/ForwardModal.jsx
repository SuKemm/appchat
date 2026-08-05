import { useState } from "react";

import Avatar from "../common/Avatar";

import {
    sendFileMessage,
    sendImageMessage,
    sendTextMessage,
} from "../../services/chat";

import { getConversationId } from "../../utils/helpers";

import useEscapeToClose from "../../hooks/useEscapeToClose";

function ForwardModal({
    message,
    user,
    users = [],
    groups = [],
    onClose,
}) {

    useEscapeToClose(onClose, Boolean(message));

    const [selectedIds, setSelectedIds] =
        useState([]);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const [done, setDone] =
        useState(false);

    if (!message) {
        return null;
    }

    // Every pickable target, tagged so we know how to route it.
    const targets = [

        ...groups.map((group) => ({
            key: `group:${group.id}`,
            isGroup: true,
            id: group.id,
            name: group.groupName,
            avatarSrc: group.groupAvatar,
            sub: `${group.participantCount ?? group.participants?.length ?? 0} thành viên`,
        })),

        ...users.map((item) => ({
            key: `user:${item.uid}`,
            isGroup: false,
            id: item.uid,
            name: item.displayName || item.email,
            avatarSrc: item.photoURL,
            sub: item.email,
        })),

    ];

    const toggle = (key) => {

        setSelectedIds((current) =>

            current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key],

        );

    };

    const handleSend = async () => {

        if (selectedIds.length === 0) {
            return;
        }

        setSending(true);
        setError("");

        try {

            await Promise.all(

                selectedIds.map((key) => {

                    const target =
                        targets.find((item) => item.key === key);

                    if (!target) {
                        return null;
                    }

                    const conversationId =
                        target.isGroup
                            ? target.id
                            : getConversationId(user, { uid: target.id });

                    const basePayload = {
                        conversationId,
                        sender: user.uid,
                        senderEmail: user.email,
                        receiver: target.isGroup ? null : target.id,
                        receiverEmail: target.isGroup ? null : target.sub,
                        isGroup: target.isGroup,
                    };

                    if (message.type === "image" && message.image) {

                        return sendImageMessage({
                            ...basePayload,
                            image: message.image,
                        });

                    }

                    if (message.type === "file" && message.file) {

                        return sendFileMessage({
                            ...basePayload,
                            file: message.file,
                        });

                    }

                    return sendTextMessage({
                        ...basePayload,
                        text: message.text || "",
                    });

                }),

            );

            setDone(true);

            setTimeout(() => {
                onClose?.();
            }, 700);

        } catch (err) {

            console.error("Failed to forward message:", err);
            setError("Chuyển tiếp thất bại. Vui lòng thử lại.");

        } finally {

            setSending(false);

        }

    };

    return (

        <div className="modal-overlay" onClick={onClose}>

            <div
                className="modal group-modal"
                onClick={(event) => event.stopPropagation()}
            >

                <header className="modal-header">

                    <h3>Chuyển tiếp tin nhắn</h3>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </header>

                <div className="modal-body">

                    <div className="forward-preview">
                        {message.type === "text" && (message.text || "")}
                        {message.type === "image" && "[Hình ảnh]"}
                        {message.type === "file" && (message.file?.name || "[Tệp đính kèm]")}
                    </div>

                    <div className="section-title">
                        Chọn người nhận ({selectedIds.length})
                    </div>

                    <div className="group-member-list">

                        {targets.length === 0 ? (

                            <div className="no-users">
                                Không có liên hệ hoặc nhóm nào
                            </div>

                        ) : (

                            targets.map((target) => {

                                const checked =
                                    selectedIds.includes(target.key);

                                return (

                                    <label
                                        key={target.key}
                                        className={
                                            checked
                                                ? "group-member active"
                                                : "group-member"
                                        }
                                    >

                                        <Avatar
                                            text={target.name}
                                            src={target.avatarSrc}
                                        />

                                        <div className="user-text">
                                            <strong>{target.name}</strong>
                                            <p>{target.sub}</p>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(target.key)}
                                        />

                                    </label>

                                );

                            })

                        )}

                    </div>

                    {error && (
                        <div className="app-error">{error}</div>
                    )}

                    {done && (
                        <div className="forward-success">
                            Đã chuyển tiếp!
                        </div>
                    )}

                </div>

                <footer className="modal-footer">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                    >
                        Huỷ
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        disabled={sending || selectedIds.length === 0}
                        onClick={handleSend}
                    >
                        {sending ? "Đang gửi..." : "Chuyển tiếp"}
                    </button>

                </footer>

            </div>

        </div>

    );

}

export default ForwardModal;
