# Cloud Functions — Email OTP

Cung cấp 2 callable functions:

| Function          | Input                    | Output                              |
|-------------------|---------------------------|--------------------------------------|
| `sendEmailOTP`    | `{ email }`               | `{ success: true, message }`         |
| `verifyEmailOTP`  | `{ email, otp }`          | `{ valid: true, message }`           |

Lưu trạng thái OTP trong Firestore, collection **`otp_requests`** (1 document / email, docId = email viết thường). Client **không** có quyền đọc/ghi collection này — chỉ Admin SDK (chạy trong Cloud Functions) truy cập được. Mã OTP chỉ lưu dưới dạng **hash (sha256)**, không bao giờ lưu plaintext.

## 1. Cài đặt

```bash
cd functions
npm install
```

## 2. Enable Phone Auth & Email/Password trên Firebase Console

Vào **Firebase Console → Authentication → Sign-in method**, bật:

- **Email/Password** (đã dùng sẵn cho đăng nhập/đăng ký hiện tại của app)
- **Phone** (nếu dự định dùng thêm đăng nhập bằng SĐT ở giai đoạn sau)

> Bước này chỉ làm được trên Console (không cấu hình qua code), Firebase yêu cầu bật thủ công cho từng provider.

## 3. Khai báo SMTP secrets (bắt buộc trước khi deploy)

Functions dùng [Cloud Functions Secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#secret-manager) (không dùng `functions.config()` cũ, không hard-code trong code):

```bash
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
firebase functions:secrets:set MAIL_FROM
```

Mỗi lệnh sẽ hỏi giá trị (nhập vào, không hiện lại trên màn hình). Ví dụ nếu dùng Gmail SMTP:

- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = địa chỉ Gmail gửi mail
- `SMTP_PASS` = **App Password** của Gmail (không phải mật khẩu đăng nhập thường — Gmail yêu cầu bật 2FA rồi tạo App Password riêng)
- `MAIL_FROM` = `"Messaging App <no-reply@yourdomain.com>"` (hoặc để trống, function sẽ tự dùng `SMTP_USER`)

Nếu dùng **Resend** thay vì SMTP thô: Resend cũng hỗ trợ SMTP relay (`smtp.resend.com`, port 587, user `resend`, pass = API key) — dùng được với cùng 5 secret trên mà không cần sửa code. Muốn dùng Resend REST API thay vì SMTP thì thay phần `buildTransporter`/`sendOtpMail` trong `index.js` bằng lệnh gọi HTTP tới Resend, cấu trúc còn lại giữ nguyên.

## 4. Chạy thử local (emulator)

```bash
cp functions/.secret.local.example functions/.secret.local
# rồi điền giá trị SMTP thật vào functions/.secret.local (file này đã bị .gitignore)

firebase emulators:start --only functions,firestore
```

## 5. Deploy

Từ thư mục gốc project (không phải trong `functions/`):

```bash
firebase deploy --only functions
```

## 6. Gọi từ client (React)

```js
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase"; // đã export sẵn trong src/firebase/index.js

const sendEmailOTP = httpsCallable(functions, "sendEmailOTP");
const verifyEmailOTP = httpsCallable(functions, "verifyEmailOTP");

await sendEmailOTP({ email });
await verifyEmailOTP({ email, otp });
```

(Xem `src/services/auth/emailOtpService.js` — đã có sẵn 2 hàm wrapper `sendEmailOtp` / `verifyEmailOtp` theo đúng convention service layer của project.)

## Các quy tắc chống spam / brute-force đã cài sẵn

- OTP hết hạn sau **5 phút**.
- Phải chờ **60 giây** giữa 2 lần gửi OTP cho cùng 1 email (`resource-exhausted` nếu gửi sớm hơn).
- Tối đa **5 lần nhập sai** cho mỗi mã, sau đó phải gửi lại mã mới (`resource-exhausted`).
- OTP chỉ dùng được **1 lần** (`consumed: true` sau khi verify thành công, verify lại sẽ báo `failed-precondition`).
