import { useEffect, useRef, useState } from "react";

// ======================================================
// Storage Helpers
// ======================================================
// There is no per-conversation unread counter on the
// backend (only per-message `seenBy`), so we track unread
// badges locally per account: whenever a conversation's
// lastMessage changes while it isn't the open conversation
// and wasn't sent by us, bump its counter. Opening a
// conversation clears it. Persisted so badges survive a
// page reload.

const STORAGE_PREFIX = "zalo_unread_counts:";

function loadCounts(uid) {

    if (!uid) {

        return {};

    }

    try {

        const raw =
            window.localStorage.getItem(
                STORAGE_PREFIX + uid,
            );

        return raw ? JSON.parse(raw) : {};

    } catch {

        return {};

    }

}

function saveCounts(uid, counts) {

    if (!uid) {

        return;

    }

    try {

        window.localStorage.setItem(

            STORAGE_PREFIX + uid,

            JSON.stringify(counts),

        );

    } catch {

        // ignore storage errors (private mode, quota, etc.)

    }

}

// ======================================================
// Hook
// ======================================================

function useUnreadCounts(

    uid,

    items,

    activeConversationId,

) {

    const [counts, setCounts] =
        useState(() => loadCounts(uid));

    const lastSeenMessageId =
        useRef({});

    // Reset tracking when the signed-in account changes.

    useEffect(() => {

        setCounts(loadCounts(uid));

        lastSeenMessageId.current = {};

    }, [uid]);

    // Watch for new incoming last messages on background
    // conversations and bump their counters.

    useEffect(() => {

        if (!uid) {

            return;

        }

        setCounts((prev) => {

            let changed = false;

            const next = { ...prev };

            items.forEach((item) => {

                const conversationId =
                    item.id;

                const lastMessage =
                    item.conversation?.lastMessage;

                if (!conversationId || !lastMessage?.id) {

                    return;

                }

                const trackedId =
                    lastSeenMessageId.current[conversationId];

                if (trackedId === lastMessage.id) {

                    return;

                }

                const isFirstObservation =
                    trackedId === undefined;

                lastSeenMessageId.current[conversationId] =
                    lastMessage.id;

                if (isFirstObservation) {

                    // Don't retroactively badge history from
                    // before this tab/session started watching.

                    return;

                }

                if (
                    conversationId === activeConversationId ||
                    lastMessage.sender === uid
                ) {

                    return;

                }

                next[conversationId] =
                    (next[conversationId] || 0) + 1;

                changed = true;

            });

            if (changed) {

                saveCounts(uid, next);

                return next;

            }

            return prev;

        });

    }, [items, uid, activeConversationId]);

    // Clear the badge for whichever conversation is open.

    useEffect(() => {

        if (!uid || !activeConversationId) {

            return;

        }

        setCounts((prev) => {

            if (!prev[activeConversationId]) {

                return prev;

            }

            const next = { ...prev };

            delete next[activeConversationId];

            saveCounts(uid, next);

            return next;

        });

    }, [uid, activeConversationId]);

    return counts;

}

export default useUnreadCounts;
