import { useMemo } from "react";

// ======================================================
// Time Helpers
// ======================================================

function toMillis(timestamp) {

    if (!timestamp) {

        return 0;

    }

    if (typeof timestamp.toMillis === "function") {

        return timestamp.toMillis();

    }

    if (typeof timestamp.seconds === "number") {

        return timestamp.seconds * 1000;

    }

    const date = new Date(timestamp);

    return Number.isNaN(date.getTime())
        ? 0
        : date.getTime();

}

// ======================================================
// Hook
// ======================================================
// Merges group conversations + direct (1-1) conversations
// + contacts without any chat history yet into a single
// Zalo-style list: one row per conversation, sorted by the
// latest message so new messages automatically jump to top.

function useConversationList(
    user,
    users = [],
    groups = [],
    directConversations = [],
) {

    const usersById =
        useMemo(() => {

            const map = new Map();

            users.forEach((item) => {

                if (item?.uid) {

                    map.set(item.uid, item);

                }

            });

            return map;

        }, [users]);

    const items =
        useMemo(() => {

            if (!user) {

                return [];

            }

            const list = [];

            const knownDirectUids =
                new Set();

            // ---- Groups ----

            groups.forEach((group) => {

                list.push({

                    key: `group:${group.id}`,

                    id: group.id,

                    isGroup: true,

                    conversation: group,

                    otherUser: null,

                    sortTime:
                        toMillis(group.lastMessage?.createdAt) ||
                        toMillis(group.updatedAt),

                });

            });

            // ---- Direct conversations ----

            directConversations.forEach((conversation) => {

                const otherUid =
                    (conversation.participants || [])
                        .find((uid) => uid !== user.uid);

                if (!otherUid) {

                    return;

                }

                knownDirectUids.add(otherUid);

                const otherUser =
                    usersById.get(otherUid) || {
                        uid: otherUid,
                    };

                list.push({

                    key: `direct:${otherUid}`,

                    id: conversation.id,

                    isGroup: false,

                    conversation,

                    otherUser,

                    sortTime:
                        toMillis(conversation.lastMessage?.createdAt) ||
                        toMillis(conversation.updatedAt),

                });

            });

            // ---- Contacts without a conversation yet ----

            users.forEach((item) => {

                if (
                    !item?.uid ||
                    item.uid === user.uid ||
                    knownDirectUids.has(item.uid)
                ) {

                    return;

                }

                list.push({

                    key: `direct:${item.uid}`,

                    id: null,

                    isGroup: false,

                    conversation: null,

                    otherUser: item,

                    sortTime: 0,

                });

            });

            // ---- Sort: pinned groups first, then latest message ----

            list.sort((a, b) => {

                const aPinned =
                    a.isGroup &&
                        (a.conversation.pinnedBy || []).includes(user.uid)
                        ? 1
                        : 0;

                const bPinned =
                    b.isGroup &&
                        (b.conversation.pinnedBy || []).includes(user.uid)
                        ? 1
                        : 0;

                if (aPinned !== bPinned) {

                    return bPinned - aPinned;

                }

                if (a.sortTime !== b.sortTime) {

                    return b.sortTime - a.sortTime;

                }

                const aName =
                    a.isGroup
                        ? (a.conversation.groupName || "")
                        : (a.otherUser?.displayName || a.otherUser?.email || "");

                const bName =
                    b.isGroup
                        ? (b.conversation.groupName || "")
                        : (b.otherUser?.displayName || b.otherUser?.email || "");

                return aName.localeCompare(bName, "vi");

            });

            return list;

        }, [user, users, groups, directConversations, usersById]);

    return {

        items,
        usersById,

    };

}

export default useConversationList;
