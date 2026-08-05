import useEscapeToClose from "../../hooks/useEscapeToClose";

function MemberProfileModal({
    member,
    displayName,
    onClose,
}) {

    useEscapeToClose(onClose, Boolean(member));

    if (!member) return null;

    const letter =
        (displayName || "?").trim().charAt(0).toUpperCase() || "?";

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

                    <h3>Trang cá nhân</h3>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </header>

                <div className="modal-body">

                    <div className="profile-avatar-section">

                        {member.photoURL ? (

                            <img
                                src={member.photoURL}
                                alt={displayName}
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />

                        ) : (

                            <div
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#dfe3e8",
                                    color: "#55606b",
                                    fontSize: 32,
                                    fontWeight: 600,
                                }}
                            >
                                {letter}
                            </div>

                        )}

                    </div>

                    <div className="section-title">
                        Tên hiển thị
                    </div>

                    <div className="profile-email">
                        {displayName}
                    </div>

                    {member.email && (

                        <>

                            <div className="section-title">
                                Email
                            </div>

                            <div className="profile-email">
                                {member.email}
                            </div>

                        </>

                    )}

                </div>

                <footer className="modal-footer">

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onClose}
                    >
                        Đóng
                    </button>

                </footer>

            </div>

        </div>

    );

}

export default MemberProfileModal;
