import { useState } from "react";

// Shows a shimmering skeleton box in place of the image until it
// has actually finished loading, then cross-fades into the real
// picture. `loading="lazy"` defers the network fetch until the
// browser judges the image is close enough to the viewport (the
// scrollable `.messages` list counts as the nearest scroll
// container), so images further down a long history don't cost
// bandwidth or memory until the user actually scrolls to them.

function ImageMessage({
    image,
}) {

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (

        <div className="message-image-wrap">

            {!loaded && !failed && (

                <span
                    className="skeleton message-image-skeleton"
                    aria-hidden="true"
                />

            )}

            {!failed && (

                <img
                    src={image}
                    alt="message"
                    className={`message-image ${loaded ? "loaded" : ""}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                />

            )}

            {failed && (

                <div className="message-image-error">

                    Không thể tải ảnh

                </div>

            )}

        </div>

    );

}

export default ImageMessage;
