// Phải khớp CHÍNH XÁC với normalizePhoneVN() / phoneToInternalEmail() trong
// functions/index.js — vì email nội bộ dùng để đăng nhập được tính lại ở
// đây (không cần round-trip lên server khi đăng nhập bằng SĐT).

const PHONE_ACCOUNT_EMAIL_DOMAIN = "phone.local";

/**
 * Chuẩn hoá số điện thoại VN về dạng "84xxxxxxxxx" (không dấu +, không số 0
 * đầu). Chấp nhận input: "0912345678", "+84912345678", "84912345678".
 * Trả về null nếu không phải số di động VN hợp lệ.
 */
export function normalizePhoneVN(phone) {

    if (typeof phone !== "string") {
        return null;
    }

    const cleaned = phone.trim().replace(/[\s.\-()]/g, "");

    let digits;

    if (/^\+84\d{9,10}$/.test(cleaned)) {

        digits = cleaned.slice(3);

    } else if (/^84\d{9,10}$/.test(cleaned)) {

        digits = cleaned.slice(2);

    } else if (/^0\d{9}$/.test(cleaned)) {

        digits = cleaned.slice(1);

    } else {

        return null;

    }

    if (!/^[35789]\d{8}$/.test(digits)) {
        return null;
    }

    return `84${digits}`;

}

// Email nội bộ (ẩn, không hiển thị cho người dùng) dùng để tái sử dụng
// signInWithEmailAndPassword / createUserWithEmailAndPassword của Firebase Auth.
export function phoneToInternalEmail(normalizedPhone) {
    return `${normalizedPhone}@${PHONE_ACCOUNT_EMAIL_DOMAIN}`;
}
