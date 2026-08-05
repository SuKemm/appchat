import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import { Send } from "lucide-react";


import {
    uploadImage,
    uploadFile,
    validateImage,
} from "../../../services/storage";


import {
    sendImageMessage,
    sendFileMessage,
} from "../../../services/chat";


import ReplyPreview from "../ReplyPreview";

import useEscapeToClose from "../../../hooks/useEscapeToClose";

import ImagePreview from "./ImagePreview";

import FilePreview from "./FilePreview";

import UploadProgress from "./UploadProgress";

import ImagePicker from "./ImagePicker";

import FilePicker from "./FilePicker";

import TextInput from "./TextInput";

import StickerPicker from "./StickerPicker";

import VoiceRecorder from "./VoiceRecorder";

function MessageInput({
    selectedUser,
    message,
    setMessage,
    sendMessage,
    conversationId,
    currentUser,
    replyMessage,
    setReplyMessage,
    setError,
    canSend = true,
    isBlocked = false,
}, ref) {

    useEscapeToClose(() => setReplyMessage?.(null), Boolean(replyMessage));

    const fileInputRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // =========================
    // Image
    // =========================

    const handleSelectImage = (event) => {

        const selected = event.target.files[0];

        if (!selected) return;

        const error = validateImage(selected);

        if (error) {

            setError?.(error);

            return;

        }

        setImageFile(selected);

        setPreview(
            URL.createObjectURL(selected)
        );

        event.target.value = "";

    };

    const handleCancelImage = () => {

        if (preview) {

            URL.revokeObjectURL(preview);

        }

        setPreview(null);

        setImageFile(null);

    };

    const handleSendImage = async () => {

        if (!imageFile || !conversationId || !canSend) return;

        try {

            const imageUrl =
                await uploadImage(imageFile);

            await sendImageMessage({

                conversationId,

                image: imageUrl,

                sender: currentUser.uid,

                senderEmail: currentUser.email,

                receiver: selectedUser.uid,

                receiverEmail: selectedUser.email,

                reply: replyMessage,

                isGroup: Boolean(selectedUser.isGroup),

            });

            URL.revokeObjectURL(preview);

            setPreview(null);

            setImageFile(null);

            setReplyMessage?.(null);

        } catch (err) {

            console.error(err);

            setError?.("Upload ảnh thất bại.");

        }

    };

    // =========================
    // File
    // =========================

    const handleSelectFile = (event) => {

        const selected = event.target.files[0];

        if (!selected) return;

        setFile(selected);

        event.target.value = "";

    };

    const handleSendFile = async () => {

        if (!file || !conversationId || !canSend) return;

        try {

            setUploading(true);

            setUploadProgress(0);

            const uploaded =
                await uploadFile(
                    file,
                    conversationId,
                    setUploadProgress
                );

            await sendFileMessage({

                conversationId,

                file: uploaded,

                sender: currentUser.uid,

                senderEmail: currentUser.email,

                receiver: selectedUser.uid,

                receiverEmail: selectedUser.email,

                reply: replyMessage,

                isGroup: Boolean(selectedUser.isGroup),

            });

            setFile(null);

            setUploading(false);

            setUploadProgress(0);

            setReplyMessage?.(null);

        } catch (err) {

            console.error(err);

            setUploading(false);

            setError?.("Upload file thất bại.");

        }

    };

    // =========================
    // Drag & Drop tệp (kéo thả từ ngoài OS vào cửa sổ chat)
    // =========================
    // Vùng bắt sự kiện kéo-thả nằm ở App.jsx (bao trọn cả header +
    // danh sách tin nhắn + thanh nhập, giống Zalo/Messenger: thả ở
    // đâu trong khung chat cũng được, không chỉ riêng thanh nhập).
    // App.jsx chỉ lo phần overlay hiển thị khi đang kéo file qua —
    // còn xử lý file thật (validate ảnh, đưa vào preview để gửi) thì
    // dùng lại đúng logic đã có sẵn cho nút chọn ảnh/tệp, để hành vi
    // luôn nhất quán dù người dùng chọn file qua nút bấm hay kéo thả.
    useImperativeHandle(ref, () => ({

        acceptDroppedFile: (droppedFile) => {

            if (!droppedFile || !canSend) return;

            if (droppedFile.type?.startsWith("image/")) {

                const validationError = validateImage(droppedFile);

                if (validationError) {

                    setError?.(validationError);

                    return;

                }

                setImageFile(droppedFile);

                setPreview(
                    URL.createObjectURL(droppedFile)
                );

                return;

            }

            setFile(droppedFile);

        },

    }), [canSend, setError]);

    return (

        <>

            <ImagePreview
                preview={preview}
                onSend={handleSendImage}
                onCancel={handleCancelImage}
            />

            <FilePreview
                file={file}
                onSend={handleSendFile}
            />

            <UploadProgress
                uploading={uploading}
                progress={uploadProgress}
            />

            <ReplyPreview
                replyMessage={replyMessage}
                onCancel={() =>
                    setReplyMessage?.(null)
                }
            />

            {canSend ? (

                <footer className="message-input">

                    {/* Trái: icon nhãn dán/sticker */}

                    <StickerPicker
                        onUnavailable={setError}
                    />

                    {/* Giữa: ô nhập, chiếm hết phần còn lại (flex-1) */}

                    <TextInput
                        selectedUser={selectedUser}
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                    />

                    {/* Phải: khi đang gõ dở → chỉ hiện nút Gửi. Khi ô
                        nhập trống → hiện bộ 3 nút chức năng (Menu tiện
                        ích, Ghi âm, Gửi ảnh), giống hành vi Zalo thật. */}

                    {message.trim() ? (

                        <button
                            type="button"
                            className="send-button"
                            disabled={!selectedUser}
                            onClick={sendMessage}
                            title="Gửi"
                        >

                            <Send size={18} />

                        </button>

                    ) : (

                        <>

                            <FilePicker
                                inputRef={fileInputRef}
                                onChange={handleSelectFile}
                            />

                            <VoiceRecorder
                                onUnavailable={setError}
                            />

                            <ImagePicker
                                onChange={handleSelectImage}
                            />

                        </>

                    )}

                </footer>

            ) : (

                <footer className="message-input message-input-locked">

                    {isBlocked
                        ? "Bạn đã bị chặn khỏi cộng đồng này."
                        : "Chỉ trưởng nhóm và phó nhóm được gửi tin nhắn trong nhóm này."}

                </footer>

            )}

        </>

    );

}

export default forwardRef(MessageInput);