import { Smile } from "lucide-react";

// Icon nhãn dán/sticker bên trái ô nhập, kiểu Zalo. Kho sticker/emoji
// picker thật chưa được xây (cần UI chọn + kho dữ liệu riêng), nên tạm
// thời chỉ báo cho người dùng biết tính năng sắp có, thay vì bấm vào
// không có phản hồi gì. Giữ nguyên vị trí/props sẵn để sau này chỉ cần
// thay phần onClick bằng logic mở sticker picker thật.
function StickerPicker({
    onUnavailable,
}) {

    return (

        <button
            type="button"
            className="sticker-button"
            onClick={() =>
                onUnavailable?.("Nhãn dán sẽ sớm ra mắt.")
            }
            title="Nhãn dán"
        >

            <Smile size={20} />

        </button>

    );

}

export default StickerPicker;
