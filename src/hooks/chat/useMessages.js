import { useEffect, useState } from "react";

import {
    subscribeMessages,
} from "../../services/chat"

function useMessages(
    conversationId,
    setError,
) {

    // =========================
    // STATE
    // =========================

    const [messages, setMessages] =
        useState([]);

    // Tracks whether the first snapshot for the *current*
    // conversationId has arrived yet, so switching chats can show
    // a skeleton instead of a jarring empty-then-filled flash.
    const [loading, setLoading] =
        useState(false);

    // =========================
    // MESSAGES
    // =========================

    useEffect(() => {

        if (!conversationId) {

            setMessages([]);

            setLoading(false);

            return;

        }

        setLoading(true);

        let unsubscribe = () => { };

        try {

            unsubscribe = subscribeMessages(

                conversationId,

                (list) => {

                    setMessages(list);

                    setLoading(false);

                },

                () => {

                    setError(
                        "Không thể tải tin nhắn."
                    );

                    setLoading(false);

                }

            );

        } catch (error) {

            console.error(
                "Failed to subscribe messages:",
                error,
            );

            setMessages([]);

            setError(
                "Không thể tải tin nhắn."
            );

            setLoading(false);

        }

        return () => {

            unsubscribe();

        };

    }, [

        conversationId,

        setError,

    ]);

    // =========================
    // EXPORTS
    // =========================

    return {

        messages,

        setMessages,

        loading,

    };

}

export default useMessages;