import {
    useEffect,
    useState,
} from "react";

import {
    doc,
    onSnapshot,
} from "firebase/firestore";

import {
    db,
} from "../../firebase";


import {
    updateTyping,
    getTypingDocument,
} from "../../services/chat";


import {
    APP_CONFIG,
} from "../../constants";


// ======================================================
// useTyping
// ======================================================

export default function useTyping(
    conversationId = null,
    user = null,
    selectedUser = null,
) {

    const uid = user?.uid ?? null;


    const [typingUsers, setTypingUsers] =
        useState([]);


    useEffect(() => {

        if (
            !conversationId ||
            !uid
        ) {

            setTypingUsers([]);

            return;

        }


        const typingRef =
            getTypingDocument(
                conversationId,
                uid,
            );


        const unsubscribe =
            onSnapshot(

                typingRef,

                (snapshot) => {

                    if (!snapshot.exists()) {

                        setTypingUsers([]);

                        return;

                    }


                    const data =
                        snapshot.data();


                    setTypingUsers(
                        Object.entries(data)
                            .filter(
                                ([id, value]) =>
                                    id !== uid &&
                                    value === true
                            )
                            .map(
                                ([id]) => id
                            )
                    );


                }

            );


        return unsubscribe;


    }, [
        conversationId,
        uid,
    ]);



    async function setTyping(value) {

        if (
            !conversationId ||
            !uid
        )
            return;


        await updateTyping({

            conversationId,

            uid,

            typing: value,

        });

    }



    const otherTyping =
        !!selectedUser &&
        typingUsers.includes(selectedUser.uid);


    return {

        typingUsers,

        setTyping,

        otherTyping,

    };

}