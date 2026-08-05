import {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    getConversationId,
} from "../../utils/helpers";

import {
    sendChatMessage,
} from "../../services/chat";

function useChat(
    user,
    selectedUser,
    setError,
) {

    // =========================
    // STATE
    // =========================

    const [message, setMessage] =
        useState("");

    const [
        replyMessage,
        setReplyMessage,
    ] = useState(null);

    // =========================
    // CONVERSATION
    // =========================

    const conversationId =
        useMemo(
            () =>
                selectedUser?.isGroup
                    ? selectedUser.uid
                    : getConversationId(
                        user,
                        selectedUser,
                    ),
            [user, selectedUser],
        );

    // =========================
    // SEND MESSAGE
    // =========================

    const sendMessage =
        useCallback(async () => {

            const text =
                message.trim();

            if (
                !text ||
                !user ||
                !selectedUser ||
                !conversationId
            ) {
                return;
            }

            try {

                await sendChatMessage({

                    conversationId,

                    text,

                    sender: user.uid,

                    senderEmail: user.email,

                    receiver: selectedUser.uid,

                    receiverEmail:
                        selectedUser.email,

                    reply: replyMessage,

                    isGroup: Boolean(selectedUser.isGroup),

                });

                setMessage("");

                setReplyMessage(null);

                setError("");

            } catch (error) {

                console.error(
                    "Failed to send message:",
                    error,
                );

                setError(
                    "Gửi tin nhắn thất bại.",
                );

            }

        }, [

            message,

            user,

            selectedUser,

            conversationId,

            replyMessage,

            setError,

        ]);

    return {

        conversationId,

        message,

        setMessage,

        sendMessage,

        replyMessage,

        setReplyMessage,

    };

}

export default useChat;