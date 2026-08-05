import { useCallback, useLayoutEffect, useRef, useState } from "react";

// ==========================================================
// useEdgeClamp
// Hover-toolbar và message-menu định vị bằng "left:0" / "right:0"
// tuyệt đối so với .message-bubble-wrap — cách này chỉ đúng khi
// khung chat đủ rộng. Khi cửa sổ hẹp lại (bong bóng tin nhắn ngắn,
// nằm sát mép trái/phải khung .messages), phần popup rộng hơn
// bong bóng sẽ tràn ra ngoài khung chat, đè lên panel bên cạnh.
//
// Hook này đo khoảng cách tràn thực tế của phần tử so với khung
// cuộn .messages (hoặc phần tử cha gần nhất nếu không tìm thấy),
// rồi trả về một transform: translateX(...) để "kéo" popup vào
// lại bên trong khung — không đổi cách định vị left/right gốc,
// chỉ bù thêm phần bị tràn.
//
// - `auto`: true thì tự đo lại khi mount + khi resize cửa sổ
//   (dùng cho message-menu, chỉ mount lúc đang mở nên không tốn
//   listener khi đóng). Với hover-toolbar (luôn mount ở mọi dòng
//   tin, kể cả đang ẩn), để auto=false và gọi recompute() thủ công
//   lúc hover vào — tránh gắn listener resize ở hàng trăm dòng tin.
// - `checkVertical`: true thì đo thêm phần tràn phía dưới khung
//   .messages (menu mở ở tin nhắn cuối cùng, gần thanh nhập tin) —
//   giống Zalo: nếu bật xuống dưới không đủ chỗ mà bật lên trên lại
//   dư chỗ hơn, tự "lật" menu mở lên trên trigger thay vì xuống dưới.
// ==========================================================

const EDGE_PADDING = 8;

function measure(el, { checkVertical }) {

    if (!el) return { shiftX: 0, flipUp: false };

    const boundary =
        el.closest(".messages") ||
        el.parentElement ||
        document.documentElement;

    const elRect = el.getBoundingClientRect();
    const boundRect = boundary.getBoundingClientRect();

    let shiftX = 0;

    const overflowRight =
        elRect.right - (boundRect.right - EDGE_PADDING);

    if (overflowRight > 0) {

        shiftX -= overflowRight;

    }

    const overflowLeft =
        (boundRect.left + EDGE_PADDING) - (elRect.left + shiftX);

    if (overflowLeft > 0) {

        shiftX += overflowLeft;

    }

    let flipUp = false;

    if (checkVertical) {

        // el đang được đo ở vị trí mặc định "bật xuống dưới trigger"
        // (CSS gốc) — dùng chính offsetParent (.message-bubble-wrap)
        // làm mốc trigger để so chỗ trống phía trên/dưới nó.
        const trigger =
            el.offsetParent || el.parentElement;

        const overflowBottom =
            elRect.bottom - (boundRect.bottom - EDGE_PADDING);

        if (trigger && overflowBottom > 0) {

            const triggerRect =
                trigger.getBoundingClientRect();

            const spaceBelow =
                boundRect.bottom - triggerRect.bottom;

            const spaceAbove =
                triggerRect.top - boundRect.top;

            if (spaceAbove > spaceBelow) {

                flipUp = true;

            }

        }

    }

    return { shiftX, flipUp };

}

function useEdgeClamp({ auto = true, checkVertical = false } = {}) {

    const ref =
        useRef(null);

    const [state, setState] =
        useState({ shiftX: 0, flipUp: false });

    const recompute = useCallback(() => {

        setState(measure(ref.current, { checkVertical }));

    }, [checkVertical]);

    useLayoutEffect(() => {

        if (!auto) return undefined;

        recompute();

        window.addEventListener("resize", recompute);

        return () => window.removeEventListener("resize", recompute);

    }, [auto, recompute]);

    const style =
        state.shiftX
            ? { transform: `translateX(${state.shiftX}px)` }
            : undefined;

    return { ref, style, flipUp: state.flipUp, recompute };

}

export default useEdgeClamp;
