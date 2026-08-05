import { useMemo, useRef, useState } from "react";

import {
    Bell,
    BellOff,
    Pin,
    PinOff,
    UserPlus,
    Settings,
    Users,
    ChevronDown,
    Clock,
    FileText,
    FileSpreadsheet,
    FileArchive,
    File as FileIcon,
    Pencil,
    X,
} from "lucide-react";

import {
    addMembers,
    changeGroupAvatar,
    leaveConversation,
    mergeGroups,
    removeMember,
    renameGroup,
    updateConversationData,
} from "../../services/conversation";

import {
    uploadImage,
    validateImage,
} from "../../services/storage";

// =========================
// HELPERS
// =========================

function formatFileSize(bytes) {

    if (bytes === null || bytes === undefined) {
        return "";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}

function formatDate(value) {

    if (!value) {
        return "";
    }

    const date =
        typeof value.toDate === "function"
            ? value.toDate()
            : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;

}

function getFileKind(name = "") {

    const ext = name.split(".").pop()?.toLowerCase() || "";

    if (["zip", "rar", "7z"].includes(ext)) {
        return "archive";
    }

    if (["xls", "xlsx", "csv"].includes(ext)) {
        return "excel";
    }

    if (["pdf"].includes(ext)) {
        return "pdf";
    }

    return "generic";

}

function FileKindIcon({ kind }) {

    if (kind === "archive") {

        return (
            <div className="group-panel-file-icon archive">
                <FileArchive size={18} color="#ffffff" />
            </div>
        );

    }

    if (kind === "excel") {

        return (
            <div className="group-panel-file-icon excel">
                <FileSpreadsheet size={18} color="#ffffff" />
            </div>
        );

    }

    if (kind === "pdf") {

        return (
            <div className="group-panel-file-icon pdf">
                <FileText size={18} color="#ffffff" />
            </div>
        );

    }

    return (
        <div className="group-panel-file-icon generic">
            <FileIcon size={18} color="#ffffff" />
        </div>
    );

}

function MiniAvatar({ name, src, size = 40, overlap = false }) {

    const letter =
        (name || "?").trim().charAt(0).toUpperCase() || "?";

    return (

        <div
            className="group-panel-mini-avatar"
            style={{
                width: size,
                height: size,
                marginLeft: overlap ? -14 : 0,
            }}
        >

            {src ? (

                <img src={src} alt={name || "avatar"} />

            ) : (

                <span>{letter}</span>

            )}

        </div>

    );

}

function SectionHeader({ title, open, onToggle }) {

    return (

        <button
            type="button"
            className="group-panel-section-header"
            onClick={onToggle}
        >

            <span className="group-panel-section-title">{title}</span>

            <ChevronDown
                size={18}
                className="group-panel-chevron"
                style={{
                    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                }}
            />

        </button>

    );

}

// =========================
// MAIN COMPONENT
// =========================

function GroupInfoModal({
    user,
    group,
    users,
    groups = [],
    messages = [],
    onClose,
    onLeft,
    onMerged,
}) {

    const avatarInputRef =
        useRef(null);

    const [groupName, setGroupName] =
        useState(group?.groupName || "");

    const [editingName, setEditingName] =
        useState(false);

    const [showManage, setShowManage] =
        useState(false);

    const [showAddMembers, setShowAddMembers] =
        useState(false);

    const [selectedIds, setSelectedIds] =
        useState([]);

    const [showMerge, setShowMerge] =
        useState(false);

    const [mergeTargetId, setMergeTargetId] =
        useState(null);

    const [busy, setBusy] =
        useState(false);

    const [uploadingAvatar, setUploadingAvatar] =
        useState(false);

    const [error, setError] =
        useState("");

    // mute / pin are per-user prefs stored on the conversation doc
    // (mutedBy / pinnedBy arrays of uid) and kept in sync live via
    // the groups subscription, so no local optimistic state needed
    const [toggleBusy, setToggleBusy] =
        useState(false);

    // collapsible sections
    const [openMembers, setOpenMembers] = useState(true);
    const [openFeed, setOpenFeed] = useState(true);
    const [openMedia, setOpenMedia] = useState(true);
    const [openFiles, setOpenFiles] = useState(true);

    const [showAllMedia, setShowAllMedia] = useState(false);

    // =========================
    // LOOKUP
    // =========================

    const usersById = useMemo(() => {

        const map = {};

        users.forEach((item) => {
            map[item.uid] = item;
        });

        map[user.uid] = user;

        return map;

    }, [users, user]);

    const participants =
        group?.participants || [];

    const admins =
        group?.admins || [];

    const owner =
        group?.owner;

    const isOwner =
        owner === user.uid;

    const isAdmin =
        admins.includes(user.uid);

    const canManage =
        isOwner || isAdmin;

    const contactsNotInGroup =
        users.filter(
            (item) => !participants.includes(item.uid),
        );

    const mergeableGroups =
        groups.filter((item) => {

            if (item.id === group.id || item.isDeleted) {
                return false;
            }

            const canManageOther =
                item.owner === user.uid ||
                item.admins?.includes(user.uid);

            return canManageOther;

        });

    const stackMembers =
        participants
            .slice(0, 4)
            .map((uid) => usersById[uid])
            .filter(Boolean);

    const mutedBy =
        group?.mutedBy || [];

    const pinnedBy =
        group?.pinnedBy || [];

    const isMuted =
        mutedBy.includes(user.uid);

    const isPinned =
        pinnedBy.includes(user.uid);

    // =========================
    // MEDIA / FILES (derived from real messages)
    // =========================

    const mediaMessages = useMemo(() => (

        messages
            .filter((item) => item.type === "image" && item.image && !item.recalled)
            .slice()
            .reverse()

    ), [messages]);

    const fileMessages = useMemo(() => (

        messages
            .filter((item) => item.type === "file" && item.file && !item.recalled)
            .slice()
            .reverse()

    ), [messages]);

    const visibleMedia =
        showAllMedia ? mediaMessages : mediaMessages.slice(0, 8);

    // =========================
    // AVATAR
    // =========================

    const handlePickAvatar = () => {

        avatarInputRef.current?.click();

    };

    const handleAvatarSelected = async (event) => {

        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        const invalidReason = validateImage(file);

        if (invalidReason) {

            setError(invalidReason);
            return;

        }

        setError("");
        setUploadingAvatar(true);

        try {

            const url = await uploadImage(file);

            await changeGroupAvatar(group.id, url);

        } catch (err) {

            console.error("Failed to change group avatar:", err);
            setError("Đổi ảnh đại diện nhóm thất bại.");

        } finally {

            setUploadingAvatar(false);

        }

    };

    // =========================
    // RENAME
    // =========================

    const handleRename = async () => {

        const trimmed = groupName.trim();

        if (!trimmed || trimmed === group.groupName) {

            setEditingName(false);
            return;

        }

        setBusy(true);
        setError("");

        try {

            await renameGroup(group.id, trimmed);

            setEditingName(false);

        } catch (err) {

            console.error("Failed to rename group:", err);
            setError("Đổi tên nhóm thất bại.");

        } finally {

            setBusy(false);

        }

    };

    // =========================
    // MUTE / PIN (per-user, persisted)
    // =========================

    const handleToggleMute = async () => {

        setToggleBusy(true);
        setError("");

        try {

            const next = isMuted
                ? mutedBy.filter((uid) => uid !== user.uid)
                : [...mutedBy, user.uid];

            await updateConversationData(group.id, {
                mutedBy: next,
            });

        } catch (err) {

            console.error("Failed to toggle mute:", err);
            setError("Cập nhật trạng thái thông báo thất bại.");

        } finally {

            setToggleBusy(false);

        }

    };

    const handleTogglePin = async () => {

        setToggleBusy(true);
        setError("");

        try {

            const next = isPinned
                ? pinnedBy.filter((uid) => uid !== user.uid)
                : [...pinnedBy, user.uid];

            await updateConversationData(group.id, {
                pinnedBy: next,
            });

        } catch (err) {

            console.error("Failed to toggle pin:", err);
            setError("Cập nhật ghim hội thoại thất bại.");

        } finally {

            setToggleBusy(false);

        }

    };

    // =========================
    // MERGE GROUPS
    // =========================

    const handleMergeGroups = async () => {

        if (!mergeTargetId) {
            return;
        }

        if (
            !window.confirm(
                "Gộp nhóm này sẽ đưa toàn bộ thành viên của 2 nhóm vào chung một nhóm. Tiếp tục?",
            )
        ) {
            return;
        }

        setBusy(true);
        setError("");

        try {

            await mergeGroups(group.id, mergeTargetId, user.uid);

            setShowMerge(false);
            setMergeTargetId(null);

            onMerged?.();

        } catch (err) {

            console.error("Failed to merge groups:", err);
            setError("Gộp nhóm thất bại. Vui lòng thử lại.");

        } finally {

            setBusy(false);

        }

    };

    // =========================
    // ADD MEMBERS
    // =========================

    const toggleSelect = (uid) => {

        setSelectedIds((current) =>

            current.includes(uid)
                ? current.filter((id) => id !== uid)
                : [...current, uid],

        );

    };

    const handleAddMembers = async () => {

        if (selectedIds.length === 0) {
            return;
        }

        setBusy(true);
        setError("");

        try {

            await addMembers(group.id, selectedIds);

            setSelectedIds([]);
            setShowAddMembers(false);

        } catch (err) {

            console.error("Failed to add members:", err);
            setError("Thêm thành viên thất bại.");

        } finally {

            setBusy(false);

        }

    };

    // =========================
    // REMOVE MEMBER
    // =========================

    const handleRemoveMember = async (uid) => {

        setBusy(true);
        setError("");

        try {

            await removeMember(group.id, uid);

        } catch (err) {

            console.error("Failed to remove member:", err);
            setError("Xoá thành viên thất bại.");

        } finally {

            setBusy(false);

        }

    };

    // =========================
    // LEAVE GROUP
    // =========================

    const handleLeave = async () => {

        setBusy(true);
        setError("");

        try {

            await leaveConversation(group.id, user.uid);

            onLeft?.();
            onClose?.();

        } catch (err) {

            console.error("Failed to leave group:", err);

            setError(
                isOwner
                    ? "Chủ nhóm cần chuyển quyền cho người khác trước khi rời nhóm."
                    : "Rời nhóm thất bại.",
            );

        } finally {

            setBusy(false);

        }

    };

    if (!group) {
        return null;
    }

    return (

        <div className="group-panel">

            {/* HEADER */}
            <header className="group-panel-header">

                <h3>Thông tin nhóm</h3>

                <button
                    type="button"
                    className="group-panel-close"
                    onClick={onClose}
                    title="Đóng"
                >
                    <X size={18} />
                </button>

            </header>

            <div className="group-panel-scroll">

                {/* GROUP INFO */}
                <div className="group-panel-info">

                    <div className="group-panel-avatar-stack">

                        <div className="group-panel-avatar-row">

                            {stackMembers.length > 0 ? (

                                stackMembers.map((member, index) => (

                                    <MiniAvatar
                                        key={member.uid}
                                        name={member.displayName || member.email}
                                        src={member.photoURL}
                                        overlap={index !== 0}
                                    />

                                ))

                            ) : (

                                <MiniAvatar
                                    name={group.groupName}
                                    src={group.groupAvatar}
                                />

                            )}

                        </div>

                        <div className="group-panel-member-badge">
                            {group.participantCount ?? participants.length}
                        </div>

                    </div>

                    {canManage && (

                        <>

                            <button
                                type="button"
                                className="group-panel-change-avatar"
                                onClick={handlePickAvatar}
                                disabled={uploadingAvatar || busy}
                            >
                                {uploadingAvatar ? "Đang tải..." : "Đổi ảnh nhóm"}
                            </button>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAvatarSelected}
                            />

                        </>

                    )}

                    {editingName ? (

                        <div className="group-panel-name-edit">

                            <input
                                type="text"
                                className="group-panel-input"
                                value={groupName}
                                onChange={(event) =>
                                    setGroupName(event.target.value)
                                }
                                disabled={busy}
                                autoFocus
                            />

                            <button
                                type="button"
                                className="group-panel-btn-primary"
                                onClick={handleRename}
                                disabled={busy}
                            >
                                Lưu
                            </button>

                        </div>

                    ) : (

                        <div className="group-panel-name-row">

                            <span className="group-panel-name">
                                {group.groupName}
                            </span>

                            {canManage && (

                                <button
                                    type="button"
                                    className="group-panel-pencil"
                                    title="Đổi tên nhóm"
                                    onClick={() => {
                                        setGroupName(group.groupName || "");
                                        setEditingName(true);
                                    }}
                                >
                                    <Pencil size={14} color="#d6d9dd" />
                                </button>

                            )}

                        </div>

                    )}

                </div>

                {/* ACTION BUTTONS */}
                <div className="group-panel-actions">

                    <button
                        type="button"
                        className="group-panel-action-btn"
                        onClick={handleToggleMute}
                        disabled={toggleBusy}
                    >

                        <span className="group-panel-action-circle">
                            {isMuted ? (
                                <BellOff size={19} color="#ffffff" />
                            ) : (
                                <Bell size={19} color="#ffffff" />
                            )}
                        </span>

                        <span className="group-panel-action-label">
                            {isMuted ? "Đã tắt thông báo" : "Bật thông báo"}
                        </span>

                    </button>

                    <button
                        type="button"
                        className="group-panel-action-btn"
                        onClick={handleTogglePin}
                        disabled={toggleBusy}
                    >

                        <span className="group-panel-action-circle">
                            {isPinned ? (
                                <PinOff size={19} color="#ffffff" />
                            ) : (
                                <Pin size={19} color="#ffffff" />
                            )}
                        </span>

                        <span className="group-panel-action-label">
                            {isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
                        </span>

                    </button>

                    <button
                        type="button"
                        className="group-panel-action-btn"
                        onClick={() => setShowAddMembers((v) => !v)}
                    >

                        <span className="group-panel-action-circle">
                            <UserPlus size={19} color="#ffffff" />
                        </span>

                        <span className="group-panel-action-label">
                            Thêm thành viên
                        </span>

                    </button>

                    <button
                        type="button"
                        className="group-panel-action-btn"
                        onClick={() => setShowManage((v) => !v)}
                    >

                        <span className="group-panel-action-circle">
                            <Settings size={19} color="#ffffff" />
                        </span>

                        <span className="group-panel-action-label">
                            Quản lý nhóm
                        </span>

                    </button>

                </div>

                {error && (
                    <div className="group-panel-error">{error}</div>
                )}

                <div className="group-panel-divider" />

                {/* ADD MEMBERS (opened from action button) */}
                {showAddMembers && (

                    <>

                        <div className="group-panel-section">

                            <div className="group-panel-section-header static">
                                <span className="group-panel-section-title">
                                    Thêm thành viên
                                </span>
                            </div>

                            <div className="group-panel-list">

                                {contactsNotInGroup.length === 0 ? (

                                    <div className="group-panel-empty">
                                        Không còn liên hệ nào để thêm
                                    </div>

                                ) : (

                                    contactsNotInGroup.map((item) => {

                                        const displayName =
                                            item.displayName || item.email;

                                        const checked =
                                            selectedIds.includes(item.uid);

                                        return (

                                            <label
                                                key={item.uid}
                                                className={
                                                    checked
                                                        ? "group-panel-row selectable active"
                                                        : "group-panel-row selectable"
                                                }
                                            >

                                                <MiniAvatar
                                                    name={displayName}
                                                    src={item.photoURL}
                                                />

                                                <span className="group-panel-row-text-wrap">
                                                    <strong>{displayName}</strong>
                                                    <span className="group-panel-row-sub">
                                                        {item.email}
                                                    </span>
                                                </span>

                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleSelect(item.uid)
                                                    }
                                                />

                                            </label>

                                        );

                                    })

                                )}

                            </div>

                            <button
                                type="button"
                                className="group-panel-btn-primary full"
                                disabled={busy || selectedIds.length === 0}
                                onClick={handleAddMembers}
                            >
                                Thêm ({selectedIds.length})
                            </button>

                        </div>

                        <div className="group-panel-divider" />

                    </>

                )}

                {/* MANAGE (opened from action button) */}
                {showManage && (

                    <>

                        <div className="group-panel-section">

                            <div className="group-panel-section-header static">
                                <span className="group-panel-section-title">
                                    Quản lý nhóm
                                </span>
                            </div>

                            {canManage && mergeableGroups.length > 0 && (

                                <div className="group-panel-manage-block">

                                    <button
                                        type="button"
                                        className="group-panel-btn-secondary"
                                        onClick={() => setShowMerge((v) => !v)}
                                    >
                                        {showMerge ? "Đóng" : "Gộp nhóm"}
                                    </button>

                                    {showMerge && (

                                        <div className="group-panel-list">

                                            {mergeableGroups.map((item) => {

                                                const checked =
                                                    mergeTargetId === item.id;

                                                return (

                                                    <label
                                                        key={item.id}
                                                        className={
                                                            checked
                                                                ? "group-panel-row selectable active"
                                                                : "group-panel-row selectable"
                                                        }
                                                    >

                                                        <MiniAvatar
                                                            name={item.groupName}
                                                            src={item.groupAvatar}
                                                        />

                                                        <span className="group-panel-row-text-wrap">
                                                            <strong>{item.groupName}</strong>
                                                            <span className="group-panel-row-sub">
                                                                {item.participantCount ??
                                                                    item.participants?.length ??
                                                                    0}{" "}
                                                                thành viên
                                                            </span>
                                                        </span>

                                                        <input
                                                            type="radio"
                                                            name="merge-target"
                                                            checked={checked}
                                                            onChange={() =>
                                                                setMergeTargetId(item.id)
                                                            }
                                                        />

                                                    </label>

                                                );

                                            })}

                                            <button
                                                type="button"
                                                className="group-panel-btn-primary full"
                                                disabled={busy || !mergeTargetId}
                                                onClick={handleMergeGroups}
                                            >
                                                Gộp vào nhóm này
                                            </button>

                                        </div>

                                    )}

                                </div>

                            )}

                            <div className="group-panel-manage-block">

                                <button
                                    type="button"
                                    className="group-panel-btn-danger"
                                    onClick={handleLeave}
                                    disabled={busy}
                                >
                                    Rời nhóm
                                </button>

                            </div>

                        </div>

                        <div className="group-panel-divider" />

                    </>

                )}

                {/* MEMBERS */}
                <div className="group-panel-section">

                    <SectionHeader
                        title={`Thành viên nhóm`}
                        open={openMembers}
                        onToggle={() => setOpenMembers((v) => !v)}
                    />

                    {openMembers && (

                        <div className="group-panel-member-list-wrap">

                            <div className="group-panel-row static">
                                <Users size={18} color="#d6d9dd" />
                                <span className="group-panel-row-text">
                                    {group.participantCount ?? participants.length} thành viên
                                </span>
                            </div>

                            <div className="group-panel-list">

                                {participants.map((uid) => {

                                    const member = usersById[uid];

                                    const displayName =
                                        member?.displayName ||
                                        member?.email ||
                                        (uid === user.uid ? "Bạn" : uid);

                                    const roleLabel =
                                        uid === owner
                                            ? "Chủ nhóm"
                                            : admins.includes(uid)
                                                ? "Quản trị viên"
                                                : null;

                                    return (

                                        <div
                                            key={uid}
                                            className="group-panel-row"
                                        >

                                            <MiniAvatar
                                                name={displayName}
                                                src={member?.photoURL}
                                            />

                                            <span className="group-panel-row-text-wrap">
                                                <strong>
                                                    {displayName}
                                                    {uid === user.uid ? " (Bạn)" : ""}
                                                </strong>
                                                <span className="group-panel-row-sub">
                                                    {roleLabel || member?.email || ""}
                                                </span>
                                            </span>

                                            {isOwner && uid !== owner && (

                                                <button
                                                    type="button"
                                                    className="group-panel-remove-btn"
                                                    title="Xoá khỏi nhóm"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleRemoveMember(uid)
                                                    }
                                                >
                                                    Xoá
                                                </button>

                                            )}

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    )}

                </div>

                <div className="group-panel-divider" />

                {/* GROUP FEED (static — no backend feature yet) */}
                <div className="group-panel-section">

                    <SectionHeader
                        title="Bảng tin nhóm"
                        open={openFeed}
                        onToggle={() => setOpenFeed((v) => !v)}
                    />

                    {openFeed && (

                        <>

                            <button type="button" className="group-panel-row" disabled>
                                <Clock size={18} color="#d6d9dd" />
                                <span className="group-panel-row-text">
                                    Danh sách nhắc hẹn
                                </span>
                            </button>

                            <button type="button" className="group-panel-row" disabled>
                                <FileText size={18} color="#d6d9dd" />
                                <span className="group-panel-row-text">
                                    Ghi chú, ghim, bình chọn
                                </span>
                            </button>

                        </>

                    )}

                </div>

                <div className="group-panel-divider" />

                {/* MEDIA (from real image messages) */}
                <div className="group-panel-section">

                    <SectionHeader
                        title="Ảnh/Video"
                        open={openMedia}
                        onToggle={() => setOpenMedia((v) => !v)}
                    />

                    {openMedia && (

                        mediaMessages.length === 0 ? (

                            <div className="group-panel-empty">
                                Chưa có ảnh/video nào
                            </div>

                        ) : (

                            <>

                                <div className="group-panel-media-grid">

                                    {visibleMedia.map((item) => (

                                        <a
                                            key={item.id}
                                            href={item.image}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group-panel-media-thumb-wrap"
                                        >
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="group-panel-media-thumb"
                                            />
                                        </a>

                                    ))}

                                </div>

                                {mediaMessages.length > 8 && (

                                    <button
                                        type="button"
                                        className="group-panel-seeall"
                                        onClick={() => setShowAllMedia((v) => !v)}
                                    >
                                        {showAllMedia ? "Thu gọn" : "Xem tất cả"}
                                    </button>

                                )}

                            </>

                        )

                    )}

                </div>

                <div className="group-panel-divider" />

                {/* FILES (from real file messages) */}
                <div className="group-panel-section">

                    <SectionHeader
                        title="File"
                        open={openFiles}
                        onToggle={() => setOpenFiles((v) => !v)}
                    />

                    {openFiles && (

                        fileMessages.length === 0 ? (

                            <div className="group-panel-empty">
                                Chưa có file nào
                            </div>

                        ) : (

                            <div className="group-panel-file-list">

                                {fileMessages.map((item) => (

                                    <a
                                        key={item.id}
                                        href={item.file?.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group-panel-file-row"
                                    >

                                        <FileKindIcon
                                            kind={getFileKind(item.file?.name)}
                                        />

                                        <span className="group-panel-file-text">

                                            <span className="group-panel-file-name">
                                                {item.file?.name}
                                            </span>

                                            <span className="group-panel-file-size">
                                                {formatFileSize(item.file?.size)}
                                            </span>

                                        </span>

                                        <span className="group-panel-file-date">
                                            {formatDate(item.createdAt)}
                                        </span>

                                    </a>

                                ))}

                            </div>

                        )

                    )}

                </div>

            </div>

        </div>

    );

}

export default GroupInfoModal;
