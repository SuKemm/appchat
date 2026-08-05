import { useEffect, useState } from "react";

import {
    subscribeDirectConversations,
} from "../../services/conversation";

function useDirectConversations(
    user,
    setError,
) {

    // =========================
    // STATE
    // =========================

    const [directConversations, setDirectConversations] =
        useState([]);

    // Tracks whether the first snapshot has arrived yet.
    const [loading, setLoading] =
        useState(true);

    // =========================
    // DIRECT CONVERSATIONS
    // =========================

    useEffect(() => {

        if (!user) {

            setDirectConversations([]);

            setLoading(false);

            return;

        }

        setLoading(true);

        let unsubscribe = () => { };

        try {

            unsubscribe = subscribeDirectConversations(

                user.uid,

                (list) => {

                    setDirectConversations(

                        (list || []).filter(
                            (item) => !item.isDeleted,
                        ),

                    );

                    setLoading(false);

                },

                (error) => {

                    console.error(
                        "[useDirectConversations] subscribeDirectConversations error:",
                        error,
                    );

                    setError?.(
                        `Không thể tải danh sách trò chuyện (${error?.code || error?.message || "unknown"}).`
                    );

                    setLoading(false);

                },

            );

        } catch (error) {

            console.error(
                "Failed to subscribe direct conversations:",
                error,
            );

            setDirectConversations([]);

            setLoading(false);

        }

        return () => {

            unsubscribe();

        };

    }, [user, setError]);

    // =========================
    // EXPORTS
    // =========================

    return {

        directConversations,
        setDirectConversations,
        loading,

    };

}

export default useDirectConversations;
