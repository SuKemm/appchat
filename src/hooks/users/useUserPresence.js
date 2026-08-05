import {
    useEffect,
    useState,
} from "react";

import {
    subscribePresence,
} from "../../services/presence";
export default function useUserPresence(uid) {

    const [presence, setPresence] =
        useState({

            online: false,

            lastSeen: null,

        });

    useEffect(() => {

        if (!uid) return;

        const unsubscribe =
            subscribePresence(
                uid,
                setPresence
            );

        return unsubscribe;

    }, [uid]);

    return presence;

}