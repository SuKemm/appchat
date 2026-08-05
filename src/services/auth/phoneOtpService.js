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
            message = error.message.includes("hết hạn")
                ? "Mã OTP đã hết hạn (5 phút). Vui lòng lấy mã mới."
                : "Phiên xác thực đã hết hạn, vui lòng xác thực lại số điện thoại.";
            break;
        case "unauthenticated":
            message = "Mã OTP không chính xác. Vui lòng kiểm tra lại.";
            break;
        case "failed-precondition":
            message = error.message || "Số điện thoại chưa được xác thực OTP.";
            break;
        case "invalid-argument":
            message = error.message || "Thông tin số điện thoại hoặc mã OTP không hợp lệ.";
            break;
        case "not-found":
            message = "Không tìm thấy yêu cầu xác thực cho số điện thoại này.";
            break;
        case "already-exists":
            message = "Số điện thoại này đã được đăng ký tài khoản.";
            break;
        default:
            if (error.message) message = error.message;
    }

    const customError = new Error(message);
    customError.code = error.code;
    return customError;
};

// =========================
// SEND PHONE OTP
// =========================

export async function sendPhoneOtp(
    phone,
) {

    try {

        const callable = httpsCallable(
            functions,
            "sendPhoneOTP",
        );

        const result = await callable({
            phone,
        });

        return result.data;

    } catch (error) {

        console.error(
            "Failed to send phone OTP:",
            error,
        );

        throw handleCallableError(error);

    }

}

// =========================
// VERIFY PHONE OTP
// =========================

export async function verifyPhoneOtp(
    phone,
    otp,
) {

    try {

        const callable = httpsCallable(
            functions,
            "verifyPhoneOTP",
        );

        const result = await callable({
            phone,
            otp,
        });

        return result.data;

    } catch (error) {

        console.error(
            "Failed to verify phone OTP:",
            error,
        );

        throw handleCallableError(error);

    }

}

// =========================
// REGISTER WITH PHONE
// =========================
// Chỉ gọi được SAU KHI verifyPhoneOtp trả về valid:true. Trả về
// { uid, loginEmail } — loginEmail là email nội bộ (<sđt>@phone.local) dùng
// để đăng nhập lại bằng signInWithEmailAndPassword, người dùng không cần biết
// giá trị này.

export async function registerWithPhone(
    phone,
    password,
    displayName,
) {

    try {

        const callable = httpsCallable(
            functions,
            "registerWithPhone",
        );

        const result = await callable({
            phone,
            password,
            displayName,
        });

        return result.data;

    } catch (error) {

        console.error(
            "Failed to register with phone:",
            error,
        );

        throw handleCallableError(error);

    }

}
