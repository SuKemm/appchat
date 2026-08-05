import React from "react";
import ReactDOM from "react-dom/client";

import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

import App from "./App";

import "./styles/variables.css";
import "./styles/global.css";

// ==========================================================
// Real viewport height fix (mobile address bar / keyboard on
// WEB / browser). Sets --vh = 1% of the ACTUAL visible viewport
// height so CSS using calc(var(--vh) * 100) always matches the
// real screen, instead of the unreliable 100vh unit.
// ==========================================================

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setViewportHeight();
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

// ==========================================================
// Keyboard height — dùng chung 1 cơ chế cho cả web lẫn app
// Capacitor, thay vì đọc số liệu `keyboardHeight` do plugin native
// báo về (đã gây ra lỗi: ô nhập bị đẩy lên cao hơn thực tế, để lại
// khoảng trống đen giữa ô nhập và bàn phím thật trên màn hình).
//
// window.visualViewport là API chuẩn của trình duyệt, phản ánh
// đúng phần màn hình THỰC SỰ còn nhìn thấy (không bị bàn phím che),
// nên tính khoảng cách bị che = window.innerHeight - vv.height -
// vv.offsetTop luôn khớp chính xác với mép trên của bàn phím đang
// hiện, không cần qua trung gian nào khác.
//
// Hoạt động đúng cho cả 2 trường hợp:
//   - Web (trình duyệt di động): bàn phím che 1 phần visualViewport.
//   - App Capacitor (Keyboard.resize = "none" trong capacitor.config
//     .json): WebView KHÔNG tự co lại theo bàn phím, nhưng Chromium/
//     WKWebView bên trong WebView vẫn tự cập nhật đúng visualViewport
//     để phản ánh phần bị bàn phím che — đây là cơ chế chuẩn hiện
//     đại (không cần native resize), nên vẫn dùng được luôn ở đây.
// ==========================================================

function updateKeyboardHeight() {

    if (!window.visualViewport) return;

    const vv = window.visualViewport;

    const offset =
        window.innerHeight - vv.height - vv.offsetTop;

    document.documentElement.style.setProperty(
        "--keyboard-height",
        `${Math.max(0, Math.round(offset))}px`,
    );

}

if (window.visualViewport) {

    updateKeyboardHeight();

    window.visualViewport.addEventListener("resize", () => {
        setViewportHeight();
        updateKeyboardHeight();
    });

    window.visualViewport.addEventListener("scroll", updateKeyboardHeight);

} else if (Capacitor.isNativePlatform()) {

    // Fallback: chỉ dùng khi WebView quá cũ, không hỗ trợ
    // visualViewport — lúc đó vẫn cần con số từ plugin native để có
    // gì đó dùng, dù kém chính xác hơn cơ chế ở trên.

    Keyboard.addListener("keyboardWillShow", (info) => {

        document.documentElement.style.setProperty(
            "--keyboard-height",
            `${info.keyboardHeight}px`,
        );

    });

    Keyboard.addListener("keyboardWillHide", () => {

        document.documentElement.style.setProperty(
            "--keyboard-height",
            "0px",
        );

    });

}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);