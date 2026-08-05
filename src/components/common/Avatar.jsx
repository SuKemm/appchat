import { Users } from "lucide-react";

function Avatar({
    text = "",
    src = null,
    online = false,
    isGroup = false,
}) {

    const safeText =
        typeof text === "string" ? text : "";

    const displayLetter =
        safeText.trim().charAt(0).toUpperCase() || "?";

    return (

        <div
            className="avatar-wrapper"
            aria-label="User avatar"
        >

            {src ? (

                <img
                    className="avatar avatar-image"
                    src={src}
                    alt={text || "Avatar"}
                    loading="lazy"
                    decoding="async"
                />

            ) : (

                <div className="avatar">

                    {displayLetter}

                </div>

            )}

            {isGroup ? (

                <span
                    className="group-badge"
                    aria-hidden="true"
                >

                    <Users size={10} strokeWidth={2.5} />

                </span>

            ) : (

                Boolean(online) && (

                    <span
                        className="online-dot"
                        aria-hidden="true"
                    />

                )

            )}

        </div>

    );

}

export default Avatar;