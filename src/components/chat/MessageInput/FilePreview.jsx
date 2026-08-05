function FilePreview({
    file,
    onSend,
}) {

    if (!file) {
        return null;
    }

    return (

        <div className="file-preview">

            <div className="file-preview-name">

                📄 {file.name}

            </div>

            <div className="file-preview-size">

                {(file.size / 1024 / 1024).toFixed(2)} MB

            </div>

            <button
                type="button"
                onClick={onSend}
            >
                Gửi file
            </button>

        </div>

    );

}

export default FilePreview;