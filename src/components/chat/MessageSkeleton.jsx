import Skeleton from "../common/Skeleton";

// A handful of alternating mine/other placeholder bubbles, shaped
// like real message rows, shown briefly while a freshly-opened
// conversation's first snapshot is still loading. Widths are
// varied so the placeholder doesn't look like a repeating grid.

const ROWS = [
    { mine: false, width: "48%" },
    { mine: true, width: "34%" },
    { mine: false, width: "62%" },
    { mine: false, width: "40%" },
    { mine: true, width: "52%" },
];

function MessageSkeleton() {

    return (

        <div aria-hidden="true">

            {ROWS.map((row, index) => (

                <div
                    key={index}
                    className={`message-skeleton-row ${row.mine ? "mine" : "other"}`}
                >

                    {!row.mine && (

                        <Skeleton
                            circle
                            width="2.125rem"
                            height="2.125rem"
                        />

                    )}

                    <Skeleton
                        className="message-skeleton-bubble"
                        width={row.width}
                        height="2.25rem"
                    />

                </div>

            ))}

        </div>

    );

}

export default MessageSkeleton;
