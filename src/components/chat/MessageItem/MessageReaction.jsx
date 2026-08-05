function MessageReaction({
    reactions = {},
}) {

    const reactionList =
        Object.values(reactions);

    const uniqueReactions =
        [...new Set(reactionList)];

    if (
        uniqueReactions.length === 0
    ) {

        return null;

    }

    return (

        <div className="message-reactions">

            {uniqueReactions.map(
                (emoji) => {

                    const count =
                        reactionList.filter(
                            (item) =>
                                item === emoji
                        ).length;

                    return (

                        <div
                            key={emoji}
                            className="reaction-pill"
                        >

                            <span>

                                {emoji}

                            </span>

                            {count > 1 && (

                                <small>

                                    {count}

                                </small>

                            )}

                        </div>

                    );

                }
            )}

        </div>

    );

}

export default MessageReaction;