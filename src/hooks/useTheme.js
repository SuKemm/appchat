import { useCallback, useEffect, useState } from "react";

// ==========================================================
// useTheme
// Nguồn sự thật duy nhất cho Light/Dark theme của toàn app.
//
// - Lưu lựa chọn của người dùng vào localStorage (key THEME_KEY)
//   để giữ nguyên giữa các lần mở app.
// - Nếu người dùng CHƯA từng chọn (chưa có trong localStorage),
//   mặc định theo `prefers-color-scheme` của hệ điều hành/trình
//   duyệt, và tiếp tục theo dõi hệ thống đổi theme cho tới khi
//   người dùng tự bấm nút đổi theme (từ đó trở đi coi như đã
//   "chốt" lựa chọn thủ công, không tự đổi theo hệ thống nữa).
// - Áp `data-theme="dark" | "light"` lên <html> — variables.css
//   định nghĩa toàn bộ token màu ghi đè trong khối
//   `:root[data-theme="dark"]`.
//
// Lưu ý: index.html có 1 đoạn <script> nhỏ chạy TRƯỚC khi React
// mount, đọc đúng localStorage key này để set data-theme ngay từ
// đầu — tránh việc trang load ra sáng rồi mới "nhấp nháy" sang
// tối (flash of wrong theme). Hook này chỉ cần đồng bộ lại state
// React với những gì script đó đã làm.
// ==========================================================

const THEME_KEY = "theme";

function getSystemTheme() {

    if (typeof window === "undefined" || !window.matchMedia) {

        return "light";

    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

}

function readStoredTheme() {

    try {

        return window.localStorage.getItem(THEME_KEY);

    } catch (err) {

        // Safari private mode / storage bị chặn — bỏ qua, coi như
        // chưa có lựa chọn lưu sẵn.
        return null;

    }

}

function applyThemeAttribute(theme) {

    document.documentElement.setAttribute("data-theme", theme);

}

function useTheme() {

    const [theme, setThemeState] = useState(() => {

        const stored = readStoredTheme();

        return stored === "dark" || stored === "light"
            ? stored
            : getSystemTheme();

    });

    // Đồng bộ attribute mỗi khi state đổi (bao gồm cả lần đầu, để
    // phòng trường hợp script inline trong index.html không chạy
    // được vì lý do gì đó).
    useEffect(() => {

        applyThemeAttribute(theme);

    }, [theme]);

    // Nếu người dùng chưa từng tự chọn theme (không có key trong
    // localStorage), tiếp tục lắng nghe hệ thống đổi Light/Dark
    // (ví dụ macOS tự chuyển tối theo giờ) và cập nhật theo.
    useEffect(() => {

        if (readStoredTheme()) {

            return undefined;

        }

        const media =
            window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (event) => {

            setThemeState(event.matches ? "dark" : "light");

        };

        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);

    }, []);

    const setTheme = useCallback((next) => {

        setThemeState(next);

        try {

            window.localStorage.setItem(THEME_KEY, next);

        } catch (err) {

            // Bỏ qua nếu không lưu được — theme vẫn áp dụng cho
            // phiên hiện tại, chỉ không nhớ lại lần sau.

        }

    }, []);

    const toggleTheme = useCallback(() => {

        setTheme(theme === "dark" ? "light" : "dark");

    }, [theme, setTheme]);

    return {
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
    };

}

export default useTheme;
