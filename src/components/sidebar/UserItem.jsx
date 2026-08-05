import Avatar from "../common/Avatar";

function UserItem({
    user,
    active,
    onClick,
}) {

    const displayName =
        user.displayName || user.email || user.phoneNumber || "Người dùng";

    const statusClass = user.online
        ? "online-text"
        : "offline-text";

    const statusText = user.online
        ? "Đang hoạt động"
        : (user.email || user.phoneNumber || "");

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
                src={user.photoURL}
                online={user.online}
            />

            <div className="conversation-text">

                <div className="conversation-row">

                    <strong className="conversation-name">
                        {displayName}
                    </strong>

                </div>

                <div className="conversation-row">

                    <p className={`conversation-preview ${statusClass}`}>
                        {statusText}
                    </p>

                </div>

            </div>

        </button>

    );

}

export default UserItem;
