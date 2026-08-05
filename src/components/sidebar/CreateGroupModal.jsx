import { useState } from "react";

import Avatar from "../common/Avatar";

import {
    createGroupConversation,
} from "../../services/conversation";

import useEscapeToClose from "../../hooks/useEscapeToClose";

function CreateGroupModal({
    user,
    users,
    onClose,
    onCreated,
    initialSelectedIds = [],
}) {

    useEscapeToClose(onClose);

    const [groupName, setGroupName] =
        useState("");

    const [selectedIds, setSelectedIds] =
        useState(initialSelectedIds);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    // =========================
    // TOGGLE MEMBER
    // =========================

    const toggleMember = (uid) => {

        setSelectedIds((current) =>

            current.includes(uid)
                ? current.filter((id) => id !== uid)
                : [...current, uid],

        );

    };

    // =========================
    // SUBMIT
    // =========================

    const handleCreate = async () => {

        const trimmedName =
            groupName.trim();

        if (!trimmedName) {

            setError("Vui lòng nhập tên nhóm.");
            return;

        }

        if (selectedIds.length < 2) {

            setError("Chọn ít nhất 2 thành viên để tạo nhóm.");
            return;

        }

        setError("");
        setSubmitting(true);

        try {

            const members =
                users.filter(
                    (item) => selectedIds.includes(item.uid),
                );

            const participants =
                [user.uid, ...selectedIds];

            const participantEmails =
                [user.email, ...members.map((item) => item.email)];

            const group =
                await createGroupConversation({

                    participants,

                    participantEmails,

                    owner: user.uid,

                    groupName: trimmedName,

                });

            onCreated?.(group);

            onClose?.();

        } catch (err) {

            console.error(
                "Failed to create group:",
                err,
            );

            setError("Tạo nhóm thất bại. Vui lòng thử lại.");

        } finally {

            setSubmitting(false);

        }

    };

    return (

        <div
            className="modal-overlay"
            onClick={onClose}
        >

            <div
                className="modal group-modal"
                onClick={(event) => event.stopPropagation()}
            >

                <header className="modal-header">

                    <h3>Tạo nhóm mới</h3>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </header>

                <div className="modal-body">

                    <input
                        type="text"
                        className="group-name-input"
                        placeholder="Tên nhóm"
                        value={groupName}
                        onChange={(event) =>
                            setGroupName(event.target.value)
                        }
                    />

                    <div className="section-title">
                        Chọn thành viên ({selectedIds.length})
                    </div>

                    <div className="group-member-list">

                        {users.length === 0 ? (

                            <div className="no-users">
                                Không có người dùng
                            </div>

                        ) : (

                            users.map((item) => {

                                const displayName =
                                    item.displayName || item.email;

                                const checked =
                                    selectedIds.includes(item.uid);

                                return (

                                    <label
                                        key={item.uid}
                                        className={
                                            checked
                                                ? "group-member active"
                                                : "group-member"
                                        }
                                    >

                                        <Avatar
                                            text={displayName}
                                            online={item.online}
                                        />

                                        <div className="user-text">

                                            <strong>
                                                {displayName}
                                            </strong>

                                            <p>
                                                {item.email}
                                            </p>

                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                toggleMember(item.uid)
                                            }
                                        />

                                    </label>

                                );

                            })

                        )}

                    </div>

                    {error && (

                        <div className="app-error">
                            {error}
                        </div>

                    )}

                </div>

                <footer className="modal-footer">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Huỷ
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleCreate}
                        disabled={submitting}
                    >
                        {submitting ? "Đang tạo..." : "Tạo nhóm"}
                    </button>

                </footer>

            </div>

        </div>

    );

}

export default CreateGroupModal;
