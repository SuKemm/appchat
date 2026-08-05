import { Mic } from "lucide-react";

// Nút "Ghi âm" bên phải ô nhập, kiểu Zalo. Ghi âm thật cần xin quyền
// micro + pipeline nén/upload audio riêng (chưa có trong storageService),
// nên tạm thời chỉ báo sắp ra mắt — giữ đúng vị trí trong thanh nhập để
// sau này chỉ cần thay onClick bằng logic bắt đầu/dừng ghi âm thật.
function VoiceRecorder({
    onUnavailable,
}) {

    return (

        <button
            type="button"
            className="voice-button"
            onClick={() =>
                onUnavailable?.("Ghi âm tin nhắn sẽ sớm ra mắt.")
            }
            title="Ghi âm"
        >

            <Mic size={18} />

        </button>

    );

}

export default VoiceRecorder;
