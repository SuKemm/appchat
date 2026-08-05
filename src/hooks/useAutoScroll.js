import {
    useEffect,
    useRef,
} from "react";

function useAutoScroll(
    dependency,
    enabled = true,
) {

    // =========================
    // REF
    // =========================

    const bottomRef =
        useRef(null);

    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        if (
            !enabled ||
            !bottomRef.current
        ) {
            return;
        }

        bottomRef.current.scrollIntoView({

            behavior: "smooth",

            block: "end",

        });

    }, [

        dependency,

        enabled,

    ]);

    // =========================
    // EXPORTS
    // =========================

    return bottomRef;

}

export default useAutoScroll;