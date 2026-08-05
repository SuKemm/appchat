import { useEffect, useState } from "react";

import {
    subscribeAuth,
} from "../../services/auth";

function useAuth() {

    // =========================
    // STATE
    // =========================

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    // =========================
    // AUTH LISTENER
    // =========================

    useEffect(() => {

        let unsubscribe = () => { };

        try {

            unsubscribe = subscribeAuth(
                (currentUser) => {

                    setUser(currentUser);

                    setLoading(false);

                }
            );

        } catch (error) {

            console.error(
                "Failed to subscribe auth:",
                error
            );

            setLoading(false);

        }

        return () => {

            unsubscribe();

        };

    }, []);

    // =========================
    // EXPORTS
    // =========================

    return {
        user,
        loading,
        setUser,
    };

}

export default useAuth;