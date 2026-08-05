import useEscapeToClose from "../../hooks/useEscapeToClose";

function PdfViewer({

    url,

    onClose,

}) {

    useEscapeToClose(onClose, Boolean(url));

    if (!url) return null;

    return (

        <div className="pdf-overlay">

            <div className="pdf-window">

                <div className="pdf-header">

                    <button
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                <iframe
                    src={url}
                    title="PDF"
                    className="pdf-frame"
                />

            </div>

        </div>

    );

}

export default PdfViewer;