import { useEffect, useState } from 'react'

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
} from 'firebase/auth'

import { auth } from '../firebase'

import {
    sendEmailOtp,
    verifyEmailOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetRecaptcha,
} from '../services/auth'

const RESEND_COOLDOWN_SECONDS = 60

function getAuthErrorMessage(error) {

    if (error.code === 'auth/email-already-in-use') {
        return 'Email này đã được sử dụng'
    }

    if (error.code === 'auth/invalid-email') {
        return 'Email không hợp lệ'
    }

    if (error.code === 'auth/weak-password') {
        return 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (error.code === 'auth/invalid-credential') {
        return 'Email hoặc mật khẩu không đúng'
    }

    return error.message
}

// Lỗi trả về từ Cloud Functions (sendEmailOTP / verifyEmailOTP) đã là
// tiếng Việt sẵn (do backend throw HttpsError với message tiếng Việt),
// nên chỉ cần lấy thẳng error.message, có fallback phòng lỗi mạng/lạ.
function getOtpErrorMessage(error) {

    if (typeof error?.message === 'string' && error.message) {
        return error.message
    }

    return 'Có lỗi xảy ra, vui lòng thử lại.'
}

// Lỗi trả về từ Firebase Phone Authentication (signInWithPhoneNumber /
// confirmationResult.confirm) — map sang tiếng Việt cho dễ hiểu.
function getPhoneErrorMessage(error) {

    switch (error?.code) {

        case 'auth/invalid-phone-number':
            return 'Số điện thoại không hợp lệ.'

        case 'auth/missing-phone-number':
            return 'Vui lòng nhập số điện thoại.'

        case 'auth/invalid-verification-code':
            return 'Mã OTP không chính xác.'

        case 'auth/code-expired':
            return 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.'

        case 'auth/missing-verification-code':
            return 'Vui lòng nhập mã OTP.'

        case 'auth/quota-exceeded':
            return 'Hệ thống đã vượt quá hạn mức gửi SMS. Vui lòng thử lại sau.'

        case 'auth/too-many-requests':
            return 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.'

        case 'auth/captcha-check-failed':
            return 'Xác thực bảo mật thất bại. Vui lòng thử lại.'

        default:
            return getOtpErrorMessage(error)

    }

}

function Login({ onLogin }) {

    // 'email' | 'phone'
    const [loginMethod, setLoginMethod] = useState('email')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [isRegister, setIsRegister] = useState(false)

    // 'form' -> nhập email/mật khẩu (hoặc số điện thoại)
    // 'otp'  -> nhập mã xác thực email (chỉ khi đăng ký bằng email)
    // 'phone-otp' -> nhập mã xác thực số điện thoại
    const [step, setStep] = useState('form')

    const [otp, setOtp] = useState('')

    const [phone, setPhone] = useState('')
    const [phoneOtp, setPhoneOtp] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)

    const [resendCooldown, setResendCooldown] = useState(0)

    const [error, setError] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [showPassword, setShowPassword] = useState(false)

    // =========================
    // RESEND COOLDOWN
    // =========================

    useEffect(() => {

        if (resendCooldown <= 0) {
            return
        }

        const timer = setTimeout(() => {
            setResendCooldown((seconds) => seconds - 1)
        }, 1000)

        return () => clearTimeout(timer)

    }, [resendCooldown])

    // Dọn reCAPTCHA khi rời khỏi trang Login (đăng nhập thành công / unmount)
    useEffect(() => {

        return () => {
            resetRecaptcha()
        }

    }, [])

    // =========================
    // SUBMIT FORM (bước 1: email + mật khẩu)
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setIsSubmitting(true)

        try {

            if (isRegister) {

                // Chặn sớm: nếu email này đã có tài khoản thì báo ngay,
                // không tốn 1 lượt gửi OTP vô ích.
                const existingMethods = await fetchSignInMethodsForEmail(
                    auth,
                    email
                )

                if (existingMethods.length > 0) {
                    setError('Email này đã được sử dụng')
                    return
                }

                // Gửi mã OTP tới email trước, CHƯA tạo tài khoản ngay —
                // tài khoản chỉ được tạo sau khi verifyEmailOtp thành công
                // (xem handleVerifyOtp).
                await sendEmailOtp(email)

                setStep('otp')
                setOtp('')
                setResendCooldown(RESEND_COOLDOWN_SECONDS)

            } else {

                const result = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                )

                onLogin(result.user)

            }

        } catch (error) {

            console.error(error)

            setError(
                isRegister
                    ? getOtpErrorMessage(error)
                    : getAuthErrorMessage(error)
            )

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // VERIFY OTP (bước 2: nhập mã, xong mới tạo tài khoản)
    // =========================

    const handleVerifyOtp = async (e) => {
        e.preventDefault()

        setError('')
        setIsSubmitting(true)

        try {

            await verifyEmailOtp(email, otp)

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )

            onLogin(result.user)

        } catch (error) {

            console.error(error)

            // Lỗi có thể đến từ verifyEmailOtp (Cloud Function) hoặc từ
            // createUserWithEmailAndPassword (Firebase Auth) — code của 2
            // loại lỗi này không trùng nhau nên dùng auth/ prefix để phân biệt.
            setError(
                typeof error.code === 'string' && error.code.startsWith('auth/')
                    ? getAuthErrorMessage(error)
                    : getOtpErrorMessage(error)
            )

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // RESEND OTP (email)
    // =========================

    const handleResendOtp = async () => {

        if (resendCooldown > 0 || isSubmitting) {
            return
        }

        setError('')
        setIsSubmitting(true)

        try {

            await sendEmailOtp(email)

            setOtp('')
            setResendCooldown(RESEND_COOLDOWN_SECONDS)

        } catch (error) {

            console.error(error)

            setError(getOtpErrorMessage(error))

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // GỬI OTP QUA SỐ ĐIỆN THOẠI
    // (dùng chung cho cả đăng ký lẫn đăng nhập — Firebase tự tạo tài
    // khoản mới nếu số điện thoại chưa từng đăng ký, ngược lại đăng
    // nhập vào tài khoản đã có)
    // =========================

    const handleSendPhoneOtp = async (e) => {
        e.preventDefault()

        setError('')
        setIsSubmitting(true)

        try {

            const confirmation = await sendPhoneOtp(phone)

            setConfirmationResult(confirmation)
            setStep('phone-otp')
            setPhoneOtp('')
            setResendCooldown(RESEND_COOLDOWN_SECONDS)

        } catch (error) {

            console.error(error)

            setError(getPhoneErrorMessage(error))

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // XÁC THỰC OTP SỐ ĐIỆN THOẠI
    // =========================

    const handleVerifyPhoneOtp = async (e) => {
        e.preventDefault()

        setError('')
        setIsSubmitting(true)

        try {

            const user = await verifyPhoneOtp(confirmationResult, phoneOtp)

            onLogin(user)

        } catch (error) {

            console.error(error)

            setError(getPhoneErrorMessage(error))

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // GỬI LẠI OTP SỐ ĐIỆN THOẠI
    // =========================

    const handleResendPhoneOtp = async () => {

        if (resendCooldown > 0 || isSubmitting) {
            return
        }

        setError('')
        setIsSubmitting(true)

        try {

            const confirmation = await sendPhoneOtp(phone)

            setConfirmationResult(confirmation)
            setPhoneOtp('')
            setResendCooldown(RESEND_COOLDOWN_SECONDS)

        } catch (error) {

            console.error(error)

            setError(getPhoneErrorMessage(error))

        } finally {
            setIsSubmitting(false)
        }
    }

    // =========================
    // NAVIGATION
    // =========================

    const toggleMode = () => {
        setIsRegister(!isRegister)
        setStep('form')
        setOtp('')
        setError('')
    }

    const switchLoginMethod = (method) => {

        if (method === loginMethod) {
            return
        }

        setLoginMethod(method)
        setStep('form')
        setError('')
        setOtp('')
        setPhoneOtp('')
        setConfirmationResult(null)
        setResendCooldown(0)
    }

    const handleBackToForm = () => {
        setStep('form')
        setOtp('')
        setPhoneOtp('')
        setError('')
    }

    // =========================
    // RENDER — BƯỚC NHẬP OTP SỐ ĐIỆN THOẠI
    // =========================

    if (step === 'phone-otp') {

        return (

            <div className="login-page">

                <div id="recaptcha-container" />

                <form
                    className="login-box"
                    onSubmit={handleVerifyPhoneOtp}
                >

                    <div className="login-logo">

                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                        </svg>

                    </div>

                    <h2>
                        Xác thực số điện thoại
                    </h2>

                    <p className="login-subtitle">
                        Nhập mã 6 số vừa được gửi tới
                        {' '}
                        <strong>{phone}</strong>
                    </p>


                    <label className="login-field otp-field">

                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="• • • • • •"
                            className="otp-input"
                            value={phoneOtp}
                            onChange={(e) => {
                                const digits = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6)

                                setPhoneOtp(digits)
                                setError('')
                            }}
                            maxLength={6}
                            autoFocus
                            required
                        />

                    </label>


                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    <button
                        className="login-button"
                        type="submit"
                        disabled={isSubmitting || phoneOtp.length !== 6}
                    >

                        {isSubmitting && (
                            <span className="login-spinner" aria-hidden="true" />
                        )}

                        {isSubmitting
                            ? 'Đang xác thực...'
                            : 'Xác nhận'}

                    </button>


                    <div className="resend-row">

                        <span>Không nhận được mã?</span>

                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResendPhoneOtp}
                            disabled={isSubmitting || resendCooldown > 0}
                        >

                            {resendCooldown > 0
                                ? `Gửi lại sau ${resendCooldown}s`
                                : 'Gửi lại mã'}

                        </button>

                    </div>


                    <button
                        className="switch-button"
                        type="button"
                        onClick={handleBackToForm}
                        disabled={isSubmitting}
                    >
                        ← Quay lại
                    </button>

                </form>

            </div>

        )

    }

    // =========================
    // RENDER — BƯỚC NHẬP OTP EMAIL
    // =========================

    if (step === 'otp') {

        return (

            <div className="login-page">

                <form
                    className="login-box"
                    onSubmit={handleVerifyOtp}
                >

                    <div className="login-logo">

                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                        </svg>

                    </div>

                    <h2>
                        Xác thực email
                    </h2>

                    <p className="login-subtitle">
                        Nhập mã 6 số vừa được gửi tới
                        {' '}
                        <strong>{email}</strong>
                    </p>


                    <label className="login-field otp-field">

                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="• • • • • •"
                            className="otp-input"
                            value={otp}
                            onChange={(e) => {
                                const digits = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6)

                                setOtp(digits)
                                setError('')
                            }}
                            maxLength={6}
                            autoFocus
                            required
                        />

                    </label>


                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    <button
                        className="login-button"
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                    >

                        {isSubmitting && (
                            <span className="login-spinner" aria-hidden="true" />
                        )}

                        {isSubmitting
                            ? 'Đang xác thực...'
                            : 'Xác nhận'}

                    </button>


                    <div className="resend-row">

                        <span>Không nhận được mã?</span>

                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResendOtp}
                            disabled={isSubmitting || resendCooldown > 0}
                        >

                            {resendCooldown > 0
                                ? `Gửi lại sau ${resendCooldown}s`
                                : 'Gửi lại mã'}

                        </button>

                    </div>


                    <button
                        className="switch-button"
                        type="button"
                        onClick={handleBackToForm}
                        disabled={isSubmitting}
                    >
                        ← Quay lại
                    </button>

                </form>

            </div>

        )

    }

    // =========================
    // RENDER — BƯỚC NHẬP SỐ ĐIỆN THOẠI
    // =========================

    if (loginMethod === 'phone') {

        return (

            <div className="login-page">

                <div id="recaptcha-container" />

                <form
                    className="login-box"
                    onSubmit={handleSendPhoneOtp}
                >

                    <div className="login-logo">

                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>

                    </div>

                    <h2>
                        Đăng nhập / Đăng ký
                    </h2>

                    <p className="login-subtitle">
                        Nhập số điện thoại để nhận mã xác thực
                    </p>


                    <div className="login-method-switch">

                        <button
                            type="button"
                            className="login-method-tab"
                            onClick={() => switchLoginMethod('email')}
                        >
                            Email
                        </button>

                        <button
                            type="button"
                            className="login-method-tab active"
                        >
                            Số điện thoại
                        </button>

                    </div>


                    <label className="login-field">

                        <span className="login-field-icon">

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>

                        </span>

                        <input
                            type="tel"
                            placeholder="Số điện thoại (VD: 0912345678)"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value)
                                setError('')
                            }}
                            autoComplete="tel"
                            required
                        />

                    </label>


                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    <button
                        className="login-button"
                        type="submit"
                        disabled={isSubmitting}
                    >

                        {isSubmitting && (
                            <span className="login-spinner" aria-hidden="true" />
                        )}

                        {isSubmitting
                            ? 'Đang gửi mã...'
                            : 'Gửi mã OTP'}

                    </button>

                    <p className="login-hint">
                        Chưa có tài khoản? Nhập số điện thoại và xác thực OTP —
                        tài khoản sẽ tự động được tạo.
                    </p>

                </form>

            </div>

        )

    }

    // =========================
    // RENDER — BƯỚC EMAIL / MẬT KHẨU
    // =========================

    return (

        <div className="login-page">

            <form
                className="login-box"
                onSubmit={handleSubmit}
            >

                <div className="login-logo">

                    <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>

                </div>

                <h2>
                    {isRegister
                        ? 'Tạo tài khoản'
                        : 'Chào mừng trở lại'}
                </h2>

                <p className="login-subtitle">
                    {isRegister
                        ? 'Đăng ký để bắt đầu trò chuyện'
                        : 'Đăng nhập để tiếp tục'}
                </p>


                <div className="login-method-switch">

                    <button
                        type="button"
                        className="login-method-tab active"
                    >
                        Email
                    </button>

                    <button
                        type="button"
                        className="login-method-tab"
                        onClick={() => switchLoginMethod('phone')}
                    >
                        Số điện thoại
                    </button>

                </div>


                <label className="login-field">

                    <span className="login-field-icon">

                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 4h16v16H4z" opacity="0" />
                            <path d="M4 6h16v12H4z" />
                            <path d="m4 6 8 7 8-7" />
                        </svg>

                    </span>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setError('')
                        }}
                        autoComplete="email"
                        required
                    />

                </label>


                <label className="login-field">

                    <span className="login-field-icon">

                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="5" y="11" width="14" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>

                    </span>

                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setError('')
                        }}
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        required
                    />

                    <button
                        type="button"
                        className="login-field-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        tabIndex={-1}
                    >

                        {showPassword ? (

                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.86 21.86 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>

                        ) : (

                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                        )}

                    </button>

                </label>


                {error && (

                    <p className="error">
                        {error}
                    </p>

                )}


                <button
                    className="login-button"
                    type="submit"
                    disabled={isSubmitting}
                >

                    {isSubmitting && (
                        <span className="login-spinner" aria-hidden="true" />
                    )}

                    {isSubmitting
                        ? (isRegister ? 'Đang gửi mã...' : 'Đang xử lý...')
                        : isRegister
                            ? 'Đăng ký'
                            : 'Đăng nhập'}

                </button>


                <button
                    className="switch-button"
                    type="button"
                    onClick={toggleMode}
                    disabled={isSubmitting}
                >

                    {isRegister
                        ? 'Đã có tài khoản? Đăng nhập'
                        : 'Chưa có tài khoản? Đăng ký'}

                </button>

            </form>

        </div>

    )
}

export default Login
