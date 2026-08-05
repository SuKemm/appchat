// Generic shimmering placeholder block. Renders a bar by default,
// or a circle when `circle` is set (e.g. for an avatar placeholder).
// Purely presentational — no state, no effects — so it's cheap to
// drop many of these into a skeleton list.

function Skeleton({
    width = "100%",
    height = "0.75rem",
    circle = false,
    className = "",
}) {

    return (

        <span
            className={
                `skeleton ${circle ? "skeleton-circle" : ""} ${className}`.trim()
            }
            style={{
                width,
                height,
            }}
            aria-hidden="true"
        />

    );

}

export default Skeleton;
