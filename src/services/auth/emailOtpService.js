import {
    httpsCallable,
} from "firebase/functions";

import {
    functions,
} from "../../firebase";
// Hàm hỗ trợ map error code từ Firebase sang thông báo tiếng Việt
const handleCallableError = (error) => {
    let message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

    switch (error.code) {
        case "resource-exhausted":
            message = error.message.includes("60")
                ? "Vui lòng chờ 60 giây trước khi yêu cầu gửi lại mã OTP mới."
                : "Bạn đã thử sai quá 5 lần. Vui lòng gửi lại mã mới.";
            break;
        case "deadline-exceeded":
            message = "Mã OTP đã hết hạn (5 phút). Vui lòng lấy mã mới.";
            break;
        case "unauthenticated":
            message = "Mã OTP không chính xác. Vui lòng kiểm tra lại.";
            break;
        case "failed-precondition":
            message = "Mã OTP này đã được sử dụng.";
            break;
        case "invalid-argument":
            message = "Thông tin email hoặc mã OTP không hợp lệ.";
            break;
        case "not-found":
            message = "Không tìm thấy yêu cầu xác thực cho email này.";
            break;
        default:
            if (error.message) message = error.message;
    }

    const customError = new Error(message);
    customError.code = error.code;
    return customError;
};
// =========================
// SEND EMAIL OTP
// =========================

export async function sendEmailOtp(
    email,
) {

    try {

        const callable = httpsCallable(
            functions,
            "sendEmailOTP",
        );

        const result = await callable({
            email,
        });

        return result.data;

    } catch (error) {

        console.error(
            "Failed to send email OTP:",
            error,
        );

        throw error;

    }

}

// =========================
// VERIFY EMAIL OTP
// =========================

export async function verifyEmailOtp(
    email,
    otp,
) {

    try {

        const callable = httpsCallable(
            functions,
            "verifyEmailOTP",
        );

        const result = await callable({
            email,
            otp,
        });

        return result.data;

    } catch (error) {

        console.error(
            "Failed to verify email OTP:",
            error,
        );

        throw error;

    }

}
