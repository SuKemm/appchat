import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

import {
    auth,
} from "../../firebase";

// reCAPTCHA verifier được tái sử dụng trong suốt vòng đời trang Login,
// chỉ tạo lại khi bị reset (sau lỗi hoặc khi rời trang).
let recaptchaVerifier = null;

// =========================
// CHUẨN HÓA SỐ ĐIỆN THOẠI (VN)
// =========================

// Chấp nhận các định dạng: 0912345678 | 912345678 | 84912345678 | +84912345678
// và trả về dạng E.164 chuẩn: +84912345678
export function normalizeVietnamPhone(rawPhone) {

    if (!rawPhone) {
        return "";
    }

    const trimmed = rawPhone.trim();

    const digitsOnly = trimmed.replace(/[^\d+]/g, "");

    if (digitsOnly.startsWith("+84")) {
        return digitsOnly;
    }

    if (digitsOnly.startsWith("84")) {
        return `+${digitsOnly}`;
    }

    if (digitsOnly.startsWith("0")) {
        return `+84${digitsOnly.slice(1)}`;
    }

    // Trường hợp người dùng nhập thiếu số 0 đầu (vd: 912345678)
    if (/^\d{9}$/.test(digitsOnly)) {
        return `+84${digitsOnly}`;
    }

    return `+${digitsOnly}`;

}

// Kiểm tra hợp lệ theo đầu số di động Việt Nam hiện hành (03/05/07/08/09)
export function isValidVietnamPhone(rawPhone) {

    const normalized = normalizeVietnamPhone(rawPhone);

    return /^\+84(3|5|7|8|9)\d{8}$/.test(normalized);

}

// Định dạng lại số +84... thành dạng 0... dễ đọc để hiển thị cho người dùng
export function formatPhoneForDisplay(phoneNumber) {

    if (!phoneNumber) {
        return "";
    }

    if (phoneNumber.startsWith("+84")) {
        return `0${phoneNumber.slice(3)}`;
    }

    return phoneNumber;

}

// =========================
// RECAPTCHA
// =========================

export function getRecaptchaVerifier(containerId = "recaptcha-container") {

    if (recaptchaVerifier) {
        return recaptchaVerifier;
    }

    recaptchaVerifier = new RecaptchaVerifier(
        auth,
        containerId,
        {
            size: "invisible",
        },
    );

    return recaptchaVerifier;

}

export function resetRecaptcha() {

    try {

        recaptchaVerifier?.clear();

    } catch (error) {

        console.error(
            "Failed to clear recaptcha:",
            error,
        );

    }

    recaptchaVerifier = null;

}

// =========================
// GỬI MÃ OTP QUA SỐ ĐIỆN THOẠI
// =========================

// Trả về một `confirmationResult` — cần lưu lại (state) để dùng ở bước xác thực.
export async function sendPhoneOtp(rawPhone) {

    if (!isValidVietnamPhone(rawPhone)) {

        const invalidError = new Error("Số điện thoại không hợp lệ.");
        invalidError.code = "auth/invalid-phone-number";
        throw invalidError;

    }

    const phoneNumber = normalizeVietnamPhone(rawPhone);

    try {

        const verifier = getRecaptchaVerifier();

        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            verifier,
        );

        return confirmationResult;

    } catch (error) {

        console.error(
            "Failed to send phone OTP:",
            error,
        );

        // reCAPTCHA đã bị Firebase "tiêu thụ" (thành công hoặc thất bại đều
        // không dùng lại được lần 2) nên phải reset để lần gửi kế tiếp
        // (thử lại / gửi lại mã) tạo challenge mới.
        resetRecaptcha();

        throw error;

    }

}

// =========================
// XÁC THỰC MÃ OTP
// =========================

export async function verifyPhoneOtp(confirmationResult, code) {

    if (!confirmationResult) {

        throw new Error("Phiên xác thực đã hết hạn, vui lòng gửi lại mã.");

    }

    try {

        const result = await confirmationResult.confirm(code);

        return result.user;

    } catch (error) {

        console.error(
            "Failed to verify phone OTP:",
            error,
        );

        throw error;

    }

}
