import { Image } from "lucide-react";

// "Gửi ảnh" — nút ngoài cùng bên phải thanh nhập, kiểu Zalo.
function ImagePicker({
    onChange,
}) {

    return (

        <label className="image-button" title="Gửi ảnh">

            <Image size={20} />

            <input
                type="file"
                accept="image/*"
                hidden
                onChange={onChange}
            />

        </label>

    );

}

export default ImagePicker;