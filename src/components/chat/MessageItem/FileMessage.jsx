import {
    formatFileSize,
    getFileIcon,
} from "../../../utils/fileIcons";

function FileMessage({
    file,
    onOpen,
}) {

    if (!file) {

        return null;

    }

    return (

        <div className="message-file">

            <div className="file-icon">

                {getFileIcon(
                    file.type,
                    file.name
                )}

            </div>

            <div className="file-info">

                <div className="file-name">

                    {file.name}

                </div>

                <div className="file-size">

                    {formatFileSize(
                        file.size
                    )}

                </div>

                <button
                    className="file-download"
                    type="button"
                    onClick={onOpen}
                >

                    📥 Mở

                </button>

            </div>

        </div>

    );

}

export default FileMessage;