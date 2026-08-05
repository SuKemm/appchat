function ImagePreview({
    preview,
    onSend,
    onCancel,
}) {

    if (!preview) {
        return null;
    }

    return (

        <div className="image-preview">

            <img
                src={preview}
                alt="Preview"
            />

            <div className="preview-actions">

                <button
                    type="button"
                    onClick={onSend}
                >
                    Gửi ảnh
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                >
                    Hủy
                </button>

            </div>

        </div>

    );

}

export default ImagePreview;