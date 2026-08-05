/**
 * Cloud Functions — OTP Email & Phone Service
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");

const admin = require("firebase-admin");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

admin.initializeApp();

const db = getFirestore();

// Region tập trung cho toàn bộ Cloud Functions
setGlobalOptions({ region: "asia-southeast1" });

// =========================
// CONFIG & SECRETS
// =========================

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây
const MAX_VERIFY_ATTEMPTS = 5;

const OTP_REQUESTS_COLLECTION = "otp_requests";
const PHONE_OTP_REQUESTS_COLLECTION = "phone_otp_requests";
const PHONE_ACCOUNT_EMAIL_DOMAIN = "phone.local";
const PHONE_REGISTRATION_WINDOW_MS = 15 * 60 * 1000; // 15 phút

const SMTP_HOST = defineSecret("SMTP_HOST");
const SMTP_PORT = defineSecret("SMTP_PORT");
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const MAIL_FROM = defineSecret("MAIL_FROM");

const SPEEDSMS_TOKEN = defineSecret("SPEEDSMS_TOKEN");
const SPEEDSMS_SENDER = defineSecret("SPEEDSMS_SENDER");

// List secret tiện tái sử dụng
const EMAIL_SECRETS = [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM];
const SMS_SECRETS = [SPEEDSMS_TOKEN, SPEEDSMS_SENDER];

// =========================
// HELPERS
// =========================

function normalizeEmail(email) {
    if (typeof email !== "string") return null;
    const trimmed = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

function generateOtp() {
    const max = 10 ** OTP_LENGTH;
    return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, "0");
}

function hashOtp(otp, identifier) {
    return crypto
        .createHash("sha256")
        .update(`${identifier}:${otp}`)
        .digest("hex");
}

function normalizePhoneVN(phone) {
    if (typeof phone !== "string") return null;
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

    if (!/^[35789]\d{8}$/.test(digits)) return null;
    return `84${digits}`;
}

function phoneToE164(normalizedPhone) {
    return `+${normalizedPhone}`;
}

function phoneToInternalEmail(normalizedPhone) {
    return `${normalizedPhone}@${PHONE_ACCOUNT_EMAIL_DOMAIN}`;
}

function buildTransporter() {
    const port = Number(SMTP_PORT.value()) || 587;
    return nodemailer.createTransport({
        host: SMTP_HOST.value(),
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER.value(),
            pass: SMTP_PASS.value(),
        },
    });
}

async function sendOtpMail(email, otp) {
    const transporter = buildTransporter();
    const fromAddress = MAIL_FROM.value() || SMTP_USER.value();

    await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Mã xác thực OTP của bạn",
        text: `Mã xác thực (OTP) của bạn là: ${otp}\nMã có hiệu lực trong 5 phút.`,
        html: `<p>Mã xác thực (OTP) của bạn là:</p>
               <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otp}</p>
               <p>Mã có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>`
    });
}

async function sendOtpSms(normalizedPhone, otp) {
    const params = new URLSearchParams({
        "access-token": SPEEDSMS_TOKEN.value(),
        to: normalizedPhone,
        content: `Ma xac thuc cua ban la: ${otp}. Khong chia se ma nay voi bat ky ai.`,
        type: "4",
        sender: SPEEDSMS_SENDER.value() || "Verify",
    });

    const response = await fetch(
        `https://api.speedsms.vn/index.php/sms/send?${params.toString()}`,
        { method: "GET" }
    );

    const result = await response.json();

    if (result.status !== "success") {
        logger.error("SpeedSMS API Error:", result);
        throw new Error(`SpeedSMS lỗi ${result.code ?? ""}: ${result.message ?? "không rõ nguyên nhân"}`);
    }

    return result;
}

// =========================
// CALLABLE FUNCTIONS
// =========================

exports.sendEmailOTP = onCall({ secrets: EMAIL_SECRETS }, async (request) => {
    const email = normalizeEmail(request.data?.email);
    if (!email) {
        throw new HttpsError("invalid-argument", "Email không hợp lệ.");
    }

    const ref = db.collection(OTP_REQUESTS_COLLECTION).doc(email);
    const existingSnap = await ref.get();

    if (existingSnap.exists) {
        const existing = existingSnap.data();
        const createdAtMs = existing.createdAt?.toMillis?.() ?? 0;
        const elapsed = Date.now() - createdAtMs;

        if (elapsed < RESEND_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
            throw new HttpsError("resource-exhausted", `Vui lòng chờ ${waitSeconds} giây trước khi gửi lại mã.`);
        }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp, email);
    const now = Date.now();

    await ref.set({
        email,
        otpHash,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(now + OTP_TTL_MS),
        attempts: 0,
        maxAttempts: MAX_VERIFY_ATTEMPTS,
        consumed: false,
    });

    try {
        await sendOtpMail(email, otp);
    } catch (error) {
        logger.error("Gửi email OTP thất bại:", error);
        throw new HttpsError("internal", "Không thể gửi email lúc này, vui lòng thử lại sau.");
    }

    return {
        success: true,
        message: "Đã gửi mã OTP tới email của bạn, mã có hiệu lực trong 5 phút.",
    };
});

exports.verifyEmailOTP = onCall(async (request) => {
    const email = normalizeEmail(request.data?.email);
    const otp = typeof request.data?.otp === "string" ? request.data.otp.trim() : "";

    if (!email || !/^\d{6}$/.test(otp)) {
        throw new HttpsError("invalid-argument", "Email hoặc mã OTP không hợp lệ.");
    }

    const ref = db.collection(OTP_REQUESTS_COLLECTION).doc(email);
    const snap = await ref.get();

    if (!snap.exists) {
        throw new HttpsError("not-found", "Không tìm thấy yêu cầu OTP cho email này, vui lòng gửi lại mã.");
    }

    const data = snap.data();
    if (data.consumed) {
        throw new HttpsError("failed-precondition", "Mã OTP này đã được sử dụng, vui lòng gửi lại mã mới.");
    }

    const expiresAtMs = data.expiresAt?.toMillis?.() ?? 0;
    if (Date.now() > expiresAtMs) {
        throw new HttpsError("deadline-exceeded", "Mã OTP đã hết hạn, vui lòng gửi lại mã mới.");
    }

    const attempts = data.attempts ?? 0;
    const maxAttempts = data.maxAttempts ?? MAX_VERIFY_ATTEMPTS;

    if (attempts >= maxAttempts) {
        throw new HttpsError("resource-exhausted", "Bạn đã nhập sai quá nhiều lần, vui lòng gửi lại mã mới.");
    }

    const expectedHash = data.otpHash;
    const actualHash = hashOtp(otp, email);

    const isMatch =
        expectedHash?.length === actualHash.length &&
        crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash));

    if (!isMatch) {
        const attemptsLeft = Math.max(maxAttempts - (attempts + 1), 0);
        await ref.update({ attempts: FieldValue.increment(1) });

        throw new HttpsError(
            "invalid-argument",
            attemptsLeft > 0
                ? `Mã OTP không đúng, còn ${attemptsLeft} lần thử.`
                : "Mã OTP không đúng, bạn đã hết lượt thử, vui lòng gửi lại mã mới."
        );
    }

    await ref.update({
        consumed: true,
        verifiedAt: FieldValue.serverTimestamp(),
    });

    return { valid: true, message: "Xác thực OTP thành công." };
});

exports.sendPhoneOTP = onCall({ secrets: SMS_SECRETS }, async (request) => {
    const phone = normalizePhoneVN(request.data?.phone);
    if (!phone) {
        throw new HttpsError("invalid-argument", "Số điện thoại không hợp lệ.");
    }

    const ref = db.collection(PHONE_OTP_REQUESTS_COLLECTION).doc(phone);
    const existingSnap = await ref.get();

    if (existingSnap.exists) {
        const existing = existingSnap.data();
        const createdAtMs = existing.createdAt?.toMillis?.() ?? 0;
        const elapsed = Date.now() - createdAtMs;

        if (elapsed < RESEND_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
            throw new HttpsError("resource-exhausted", `Vui lòng chờ ${waitSeconds} giây trước khi gửi lại mã.`);
        }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp, phone);
    const now = Date.now();

    await ref.set({
        phone,
        otpHash,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(now + OTP_TTL_MS),
        attempts: 0,
        maxAttempts: MAX_VERIFY_ATTEMPTS,
        consumed: false,
        verifiedAt: null,
        usedForRegistration: false,
    });

    try {
        await sendOtpSms(phone, otp);
    } catch (error) {
        logger.error("Gửi SMS OTP thất bại:", error);
        throw new HttpsError("internal", "Không thể gửi SMS lúc này, vui lòng thử lại sau.");
    }

    return {
        success: true,
        message: "Đã gửi mã OTP tới số điện thoại của bạn, mã có hiệu lực trong 5 phút.",
    };
});

exports.verifyPhoneOTP = onCall(async (request) => {
    const phone = normalizePhoneVN(request.data?.phone);
    const otp = typeof request.data?.otp === "string" ? request.data.otp.trim() : "";

    if (!phone || !/^\d{6}$/.test(otp)) {
        throw new HttpsError("invalid-argument", "Số điện thoại hoặc mã OTP không hợp lệ.");
    }

    const ref = db.collection(PHONE_OTP_REQUESTS_COLLECTION).doc(phone);
    const snap = await ref.get();

    if (!snap.exists) {
        throw new HttpsError("not-found", "Không tìm thấy yêu cầu OTP cho số này, vui lòng gửi lại mã.");
    }

    const data = snap.data();
    if (data.consumed) {
        throw new HttpsError("failed-precondition", "Mã OTP này đã được sử dụng, vui lòng gửi lại mã mới.");
    }

    const expiresAtMs = data.expiresAt?.toMillis?.() ?? 0;
    if (Date.now() > expiresAtMs) {
        throw new HttpsError("deadline-exceeded", "Mã OTP đã hết hạn, vui lòng gửi lại mã mới.");
    }

    const attempts = data.attempts ?? 0;
    const maxAttempts = data.maxAttempts ?? MAX_VERIFY_ATTEMPTS;

    if (attempts >= maxAttempts) {
        throw new HttpsError("resource-exhausted", "Bạn đã nhập sai quá nhiều lần, vui lòng gửi lại mã mới.");
    }

    const expectedHash = data.otpHash;
    const actualHash = hashOtp(otp, phone);

    const isMatch =
        expectedHash?.length === actualHash.length &&
        crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash));

    if (!isMatch) {
        const attemptsLeft = Math.max(maxAttempts - (attempts + 1), 0);
        await ref.update({ attempts: FieldValue.increment(1) });

        throw new HttpsError(
            "invalid-argument",
            attemptsLeft > 0
                ? `Mã OTP không đúng, còn ${attemptsLeft} lần thử.`
                : "Mã OTP không đúng, bạn đã hết lượt thử, vui lòng gửi lại mã mới."
        );
    }

    await ref.update({
        consumed: true,
        verifiedAt: FieldValue.serverTimestamp(),
    });

    return { valid: true, message: "Xác thực số điện thoại thành công." };
});

exports.registerWithPhone = onCall(async (request) => {
    const phone = normalizePhoneVN(request.data?.phone);
    const password = typeof request.data?.password === "string" ? request.data.password : "";
    const displayName = typeof request.data?.displayName === "string" ? request.data.displayName.trim() : "";

    if (!phone) {
        throw new HttpsError("invalid-argument", "Số điện thoại không hợp lệ.");
    }

    if (password.length < 6) {
        throw new HttpsError("invalid-argument", "Mật khẩu phải có ít nhất 6 ký tự.");
    }

    const ref = db.collection(PHONE_OTP_REQUESTS_COLLECTION).doc(phone);
    const snap = await ref.get();

    if (!snap.exists) {
        throw new HttpsError("failed-precondition", "Bạn chưa xác thực số điện thoại này, vui lòng gửi mã OTP trước.");
    }

    const data = snap.data();
    if (!data.consumed) {
        throw new HttpsError("failed-precondition", "Số điện thoại chưa được xác thực OTP.");
    }

    if (data.usedForRegistration) {
        throw new HttpsError("failed-precondition", "Số điện thoại này đã được dùng để đăng ký tài khoản trước đó.");
    }

    const verifiedAtMs = data.verifiedAt?.toMillis?.() ?? 0;
    if (Date.now() - verifiedAtMs > PHONE_REGISTRATION_WINDOW_MS) {
        throw new HttpsError("deadline-exceeded", "Phiên xác thực đã hết hạn, vui lòng xác thực lại số điện thoại.");
    }

    const loginEmail = phoneToInternalEmail(phone);
    let userRecord;

    try {
        userRecord = await getAuth().createUser({
            email: loginEmail,
            password,
            phoneNumber: phoneToE164(phone),
            displayName: displayName || undefined,
        });
    } catch (error) {
        logger.error("Tạo tài khoản bằng SĐT thất bại:", error);
        if (
            error.code === "auth/phone-number-already-exists" ||
            error.code === "auth/email-already-exists"
        ) {
            throw new HttpsError("already-exists", "Số điện thoại này đã được đăng ký tài khoản.");
        }
        throw new HttpsError("internal", "Không thể tạo tài khoản lúc này, vui lòng thử lại sau.");
    }

    await ref.update({ usedForRegistration: true });

    return {
        success: true,
        uid: userRecord.uid,
        loginEmail,
        message: "Đăng ký tài khoản bằng số điện thoại thành công.",
    };
});