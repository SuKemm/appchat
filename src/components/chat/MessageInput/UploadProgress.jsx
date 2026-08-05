function UploadProgress({
    uploading,
    progress,
}) {

    if (!uploading) {
        return null;
    }

    return (

        <div className="upload-progress">

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`,
                    }}
                />

            </div>

            <div className="progress-text">

                {progress}%

            </div>

        </div>

    );

}

export default UploadProgress;