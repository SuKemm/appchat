import { useEffect, useState } from "react";

import {
    saveUser,
    subscribeUsers,
} from "../../services/users";

function useUsers(
    user,
    setError,
) {

    // =========================
    // STATE
    // =========================

    const [users, setUsers] =
        useState([]);

    // Tracks whether the first snapshot for the current user has
    // arrived yet, so the UI can show a skeleton instead of an
    // empty state while the real list is still loading.
    const [loading, setLoading] =
        useState(true);

    // =========================
    // USERS
    // =========================

    useEffect(() => {

        if (!user) {

            setUsers([]);

            setLoading(false);

            return;

        }

        setLoading(true);

        const initializeUser = async () => {

            try {

                await saveUser(user);

            } catch (error) {

                console.error(
                    "Failed to save user:",
                    error
                );

            }

        };

        initializeUser();

        let unsubscribe = () => { };

        unsubscribe = subscribeUsers(

            user.uid,

            (list) => {

                setUsers(list);

                setLoading(false);

            },

            () => {

                setError(
                    "Không thể tải danh sách tài khoản."
                );

                setLoading(false);

            }

        );

        return () => {

            unsubscribe();

        };

    }, [user, setError]);

    // =========================
    // EXPORTS
    // =========================

    return {

        users,
        setUsers,
        loading,

    };

}

export default useUsers;