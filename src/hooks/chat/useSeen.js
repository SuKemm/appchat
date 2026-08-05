import { useEffect } from "react";

import {
    markAsSeen,
} from "../../services/chat";
function useSeen(
    messages,
    conversationId,
    currentUser,
) {

    // =========================
    // SEEN
    // =========================

    useEffect(() => {

        if (
            !conversationId ||
            !currentUser ||
            messages.length === 0
        ) {

            return;

        }

        const unseenMessages =
            messages.filter(

                (message) =>

                    message.receiver ===
                    currentUser.uid &&

                    !(message.seenBy || []).includes(currentUser.uid),

            );

        if (
            unseenMessages.length === 0
        ) {

            return;

        }

        Promise.all(

            unseenMessages.map(

                (message) =>

                    markAsSeen(

                        conversationId,

                        message.id,

                        currentUser.uid,

                    ),

            ),

        ).catch((error) => {

            console.error(

                "Failed to mark messages as seen:",

                error,

            );

        });

    }, [

        messages,

        conversationId,

        currentUser,

    ]);

}

export default useSeen;