import Avatar from "../common/Avatar";

function CurrentUser({
    user,
    onClick,
}) {

    const displayName =
        user.displayName || user.email || user.phoneNumber || "Người dùng";

    const subtitle =
        user.email || user.phoneNumber || "";

    return (

        <button
            type="button"
            className="current-user"
            onClick={onClick}
        >

            <Avatar
                text={displayName}
                src={user.photoURL}
                online={true}
            />

            <div className="user-text">

                <strong>
                    {displayName}
                </strong>

                <p>
                    {subtitle}
                </p>

            </div>

        </button>

    );

}

export default CurrentUser;
