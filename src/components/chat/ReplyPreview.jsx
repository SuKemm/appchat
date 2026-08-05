import { X } from "lucide-react";

function ReplyPreview({
    replyMessage,
    onCancel,
}) {

    if (!replyMessage) return null;

    const preview =
        replyMessage.type === "image"
            ? "📷 Ảnh"
            : replyMessage.type === "file"
                ? "📄 " + (replyMessage.file?.name || "Tệp")
                : replyMessage.text;

    return (

        <div className="reply-bar">

            <div className="reply-bar-content">

                <small>Đang trả lời</small>

                <p>{preview}</p>

            </div>

            <button
                type="button"
                className="reply-bar-cancel"
                onClick={onCancel}
                aria-label="Hủy trả lời"
            >
                <X size={16} />
            </button>

        </div>

    );

}

export default ReplyPreview;
