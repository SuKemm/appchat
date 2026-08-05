import { useRef, useState } from "react";

import { updateProfile } from "firebase/auth";

import { auth } from "../../firebase";

import Avatar from "../common/Avatar";

import useEscapeToClose from "../../hooks/useEscapeToClose";

import {
    updateUserProfile,
} from "../../services/users";

import {
    uploadImage,
    validateImage,
} from "../../services/storage";

function ProfileModal({
    user,
    onClose,
    onUpdated,
}) {

    useEscapeToClose(onClose);

    const fileInputRef =
        useRef(null);

    const [displayName, setDisplayName] =
        useState(user?.displayName || "");

    const [photoURL, setPhotoURL] =
        useState(user?.photoURL || null);

    const [uploading, setUploading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // =========================
    // CHANGE AVATAR
    // =========================

    const handlePickAvatar = () => {

        fileInputRef.current?.click();

    };

    const handleAvatarSelected = async (event) => {

        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        const invalidReason = validateImage(file);

        if (invalidReason) {

            setError(invalidReason);
            return;

        }

        setError("");
        setUploading(true);

        try {

            const url = await uploadImage(file);

            setPhotoURL(url);

        } catch (err) {

            console.error("Failed to upload avatar:", err);
            setError("Tải ảnh đại diện thất bại.");

        } finally {

            setUploading(false);

        }

    };

    // =========================
    // SAVE PROFILE
    // =========================

    const handleSave = async () => {

        const trimmedName = displayName.trim();

        if (!trimmedName) {

            setError("Vui lòng nhập tên hiển thị.");
            return;

        }

        setError("");
        setSaving(true);

        try {

            await updateProfile(auth.currentUser, {

                displayName: trimmedName,

                photoURL: photoURL || null,

            });

            await updateUserProfile(user.uid, {

                displayName: trimmedName,

                photoURL: photoURL || null,

            });

            onUpdated?.({

                ...user,

                displayName: trimmedName,

                photoURL: photoURL || null,

            });

            onClose?.();

        } catch (err) {

            console.error("Failed to update profile:", err);
            setError("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");

        } finally {

            setSaving(false);

        }

    };

    return (

        <div
            className="modal-overlay"
            onClick={onClose}
        >

            <div
                className="modal group-modal"
                onClick={(event) => event.stopPropagation()}
            >

                <header className="modal-header">

                    <h3>Hồ sơ của tôi</h3>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </header>

                <div className="modal-body">

                    <div className="profile-avatar-section">

                        <Avatar
                            text={displayName || user?.email || user?.phoneNumber}
                            src={photoURL}
                            online={true}
                        />

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handlePickAvatar}
                            disabled={uploading || saving}
                        >
                            {uploading ? "Đang tải..." : "Đổi ảnh đại diện"}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarSelected}
                        />

                    </div>

                    <div className="section-title">
                        Tên hiển thị
                    </div>

                    <input
                        type="text"
                        className="group-name-input"
                        value={displayName}
                        onChange={(event) =>
                            setDisplayName(event.target.value)
                        }
                        disabled={saving}
                    />

                    <div className="section-title">
                        {user?.email ? "Email" : "Số điện thoại"}
                    </div>

                    <div className="profile-email">
                        {user?.email || user?.phoneNumber || "—"}
                    </div>

                    {error && (

                        <div className="app-error">
                            {error}
                        </div>

                    )}

                </div>

                <footer className="modal-footer">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Huỷ
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleSave}
                        disabled={saving || uploading}
                    >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>

                </footer>

            </div>

        </div>

    );

}

export default ProfileModal;
