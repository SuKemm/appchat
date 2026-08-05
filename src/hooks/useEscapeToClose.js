import { useEffect } from "react";

// ==========================================================
// useEscapeToClose
// Dùng chung cho mọi modal/menu/bottom-sheet trong app: nhấn
// phím Escape sẽ đóng lớp đang mở trên cùng, giống hành vi
// chuẩn của mọi app desktop (Zalo PC, Messenger web...).
//
// - `active`: chỉ gắn listener khi overlay đang thực sự mở —
//   quan trọng với các component luôn được mount nhưng ẩn/hiện
//   qua CSS (vd MessageActionSheet dùng prop `visible`), để
//   tránh nhiều overlay cùng lắng nghe Escape một lúc.
// - Không dùng `stopPropagation` ở đây — nếu có nhiều lớp lồng
//   nhau cùng mở (hiếm khi xảy ra trong app này), mỗi lớp tự
//   đóng lớp của mình, không ảnh hưởng lớp khác.
// ==========================================================

function useEscapeToClose(onClose, active = true) {

    useEffect(() => {

        if (!active || !onClose) {

            return undefined;

        }

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                onClose();

            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [active, onClose]);

}

export default useEscapeToClose;
