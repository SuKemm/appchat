import {
    useEffect,
    useState,
} from "react";

import {
    subscribePresence,
} from "../../services/presence";

function useUserPresence(uid) {

    // =========================
    // STATE
    // =========================

    const [presence, setPresence] =
        useState({

            online: false,

            lastSeen: null,

        });

    // =========================
    // PRESENCE
    // =========================

    useEffect(() => {

        if (!uid) {

            setPresence({

                online: false,

                lastSeen: null,

            });

            return;

        }

        let unsubscribe = () => { };

        try {

            unsubscribe =
                subscribePresence(

                    uid,

                    setPresence,

                );

        } catch (error) {

            console.error(

                "Failed to subscribe presence:",

                error,

            );

            setPresence({

                online: false,

                lastSeen: null,

            });

        }

        return () => {

            unsubscribe();

        };

    }, [uid]);

    // =========================
    // EXPORTS
    // =========================

    return presence;

}

export default useUserPresence;