import { Plus } from "lucide-react";

// "Menu tiện ích" bên phải ô nhập (kiểu Zalo: nút "+" mở các lựa chọn
// gửi kèm). Hiện chỉ có 1 lựa chọn thật sự tồn tại (gửi tệp), nên bấm
// vào mở thẳng file picker thay vì phải qua thêm 1 lớp menu trung gian
// — vẫn đúng vai trò/vị trí "menu tiện ích" trong bố cục, chỉ cần thêm
// lựa chọn khác (ghi chú, danh thiếp...) sau này qua đúng nút này.
function FilePicker({
    inputRef,
    onChange,
}) {

    return (

        <>

            <input
                ref={inputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.zip"
                onChange={onChange}
            />

            <button
                type="button"
                className="file-button"
                onClick={() =>
                    inputRef.current?.click()
                }
                title="Thêm tệp"
            >

                <Plus size={20} />

            </button>

        </>

    );

}

export default FilePicker;