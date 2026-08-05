import Skeleton from "../common/Skeleton";

// Renders a handful of placeholder rows shaped like a real
// ConversationItem (avatar circle + name line + preview line),
// shown in the sidebar while the conversation list is loading for
// the first time. `count` rows is usually enough to fill the
// visible viewport without over-rendering off-screen ones.

function ConversationSkeleton({
    count = 8,
}) {

    return (

        <div aria-hidden="true">

            {Array.from({ length: count }).map((_, index) => (

                <div
                    key={index}
                    className="conversation-skeleton"
                >

                    <Skeleton
                        circle
                        width="var(--avatar-md)"
                        height="var(--avatar-md)"
                    />

                    <div className="conversation-skeleton-text">

                        <Skeleton
                            width={index % 3 === 0 ? "55%" : "70%"}
                            height=".8125rem"
                        />

                        <Skeleton
                            width={index % 2 === 0 ? "40%" : "50%"}
                            height=".75rem"
                        />

                    </div>

                </div>

            ))}

        </div>

    );

}

export default ConversationSkeleton;
