import { X } from "lucide-react";

import "../../styles/memberActionSheet.css";

import useEscapeToClose from "../../hooks/useEscapeToClose";

function MemberAvatar({ name, src }) {

    const letter =
        (name || "?").trim().charAt(0).toUpperCase() || "?";

    return (

        <div className="member-sheet-avatar">

            {src ? (

                <img src={src} alt={name || "avatar"} />

            ) : (

                <span>{letter}</span>

            )}

        </div>

    );

}

function MemberActionSheet({
    visible,
    member,
    displayName,
    isSelf,
    canManage,
    isTargetOwner,
    isTargetAdmin,
    isTargetBlocked,
    busy,
    onClose,
    onViewProfile,
    onPromote,
    onDemote,
    onTransferOwnership,
    onBlock,
    onUnblock,
    onRemove,
}) {

    useEscapeToClose(onClose, visible);

    if (!visible) return null;

    const run = (fn) => () => {

        fn?.();

    };

    const showRoleActions =
        canManage && !isSelf && !isTargetOwner;

    return (

        <div
            className="sheet-overlay"
            onClick={onClose}
        >

            <div
                className="member-sheet"
                onClick={(event) => event.stopPropagation()}
            >

                <header className="member-sheet-header">

                    <h3>Thông tin thành viên</h3>

                    <button
                        type="button"
                        className="member-sheet-close"
                        onClick={onClose}
                        title="Đóng"
                    >
                        <X size={18} />
                    </button>

                </header>

                <div className="member-sheet-profile">

                    <MemberAvatar
                        name={displayName}
                        src={member?.photoURL}
                    />

                    <span className="member-sheet-name">
                        {displayName}
                        {isSelf ? " (Bạn)" : ""}
                    </span>

                </div>

                <div className="member-sheet-actions">

                    <button
                        type="button"
                        onClick={run(onViewProfile)}
                    >
                        Xem trang cá nhân
                    </button>

                    {showRoleActions && !isTargetBlocked && (

                        <>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={run(
                                    isTargetAdmin ? onDemote : onPromote,
                                )}
                            >
                                {isTargetAdmin
                                    ? "Gỡ quyền phó cộng đồng"
                                    : "Bổ nhiệm làm phó cộng đồng"}
                            </button>

                            {onTransferOwnership && (

                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={run(onTransferOwnership)}
                                >
                                    Chuyển quyền trưởng cộng đồng
                                </button>

                            )}

                        </>

                    )}

                    {showRoleActions && (

                        <>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={run(
                                    isTargetBlocked ? onUnblock : onBlock,
                                )}
                            >
                                {isTargetBlocked
                                    ? "Bỏ chặn thành viên"
                                    : "Chặn thành viên"}
                            </button>

                            <button
                                type="button"
                                className="danger"
                                disabled={busy}
                                onClick={run(onRemove)}
                            >
                                Xoá khỏi cộng đồng
                            </button>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}

export default MemberActionSheet;
