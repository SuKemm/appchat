export function getConversationId(userA, userB) {
    if (!userA?.uid || !userB?.uid) {
        return null;
    }

    return [userA.uid, userB.uid]
        .sort()
        .join("_");
}

export function getInitial(value = "") {
    return (
        value
            .trim()
            .charAt(0)
            .toUpperCase() || "?"
    );
}