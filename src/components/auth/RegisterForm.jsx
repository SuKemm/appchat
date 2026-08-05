import React, { useState, useEffect } from 'react';
import { sendEmailOtp, verifyEmailOtp } from '../../services/auth/emailOtpService';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Nhập Email -> Step 2: Nhập OTP
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Đếm ngược 60s cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendEmailOtp(email);
      setSuccessMsg(res.message || 'Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
      setCountdown(60); // Đặt cooldown 60 giây chống spam
    } catch (err) {
      setError(err.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await verifyEmailOtp(email, otp);
      if (res.valid) {
        setSuccessMsg('Xác thực email thành công! Đang tiến hành tạo tài khoản...');
        // TODO: Gọi hàm đăng ký tài khoản chính (Firebase AuthcreateUserWithEmailAndPassword...)
      }
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Đăng ký Tài khoản</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

      {step === 1 ? (
        /* BƯỚC 1: NHẬP EMAIL */
        <form onSubmit={handleSendOtp}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="nhap-email@gmail.com"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>
      ) : (
        /* BƯỚC 2: NHẬP MÃ OTP */
        <form onSubmit={handleVerifyOtp}>
          <p>Mã xác thực đã được gửi tới: <b>{email}</b></p>
          <div>
            <label>Nhập mã OTP (6 chữ số):</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
          </button>

          <div style={{ marginTop: '15px' }}>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || countdown > 0}
            >
              {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã OTP'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ marginLeft: '10px' }}>
              Đổi Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}