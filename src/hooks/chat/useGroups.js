import { useEffect, useState } from "react";

import {
    subscribeGroupConversations,
} from "../../services/conversation";

function useGroups(
    user,
    setError,
) {

    // =========================
    // STATE
    // =========================

    const [groups, setGroups] =
        useState([]);

    // Tracks whether the first snapshot has arrived yet.
    const [loading, setLoading] =
        useState(true);

    // =========================
    // GROUPS
    // =========================

    useEffect(() => {

        if (!user) {

            setGroups([]);

            setLoading(false);

            return;

        }

        setLoading(true);

        let unsubscribe = () => { };

        try {

            unsubscribe = subscribeGroupConversations(

                user.uid,

                (list) => {

                    setGroups(

                        (list || []).filter(
                            (group) => !group.isDeleted,
                        ),

                    );

                    setLoading(false);

                },

                (error) => {

                    console.error(
                        "[useGroups] subscribeGroupConversations error:",
                        error,
                    );

                    setError?.(
                        `Không thể tải danh sách nhóm (${error?.code || error?.message || "unknown"}).`
                    );

                    setLoading(false);

                },

            );

        } catch (error) {

            console.error(
                "Failed to subscribe groups:",
                error,
            );

            setGroups([]);

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

        groups,
        setGroups,
        loading,

    };

}

export default useGroups;
