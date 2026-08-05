import ReplyMessage from "./ReplyMessage";
import ImageMessage from "./ImageMessage";
import FileMessage from "./FileMessage";
import MessageReaction from "./MessageReaction";
import MessageMeta from "./MessageMeta";

function Bubble({
    message,
    isMine,
    senderDisplayName,
    onOpenPdf,
}) {

    return (

        <div
            className={`message-wrapper ${isMine ? "mine" : "other"
                }`}
        >

            {!isMine && (

                <div className="sender-name">

                    {senderDisplayName}

                </div>

            )}

            <ReplyMessage
                reply={message.reply}
            />

            {/* Bọc bubble + reaction pill trong 1 khối position:relative
                riêng (KHÔNG gồm MessageMeta) để pill "đè" đúng lên góc
                dưới-phải CỦA BONG BÓNG (kiểu Zalo) — thay vì lệch xuống
                dưới meta (giờ / đã xem) hoặc rớt khỏi khung chat như khi
                định vị bằng margin âm trong luồng layout (cách cũ). */}
            <div className="message-bubble-shell">

                <div
                    className={`message-bubble ${isMine
                            ? "mine"
                            : "other"
                        }`}
                >

                    {(message.recalled || message.deleted) ? (

                        <i className="recalled-message">

                            {message.recalled
                                ? "Tin nhắn đã được thu hồi"
                                : "Tin nhắn đã bị xóa"}

                        </i>

                    ) : (

                        <>

                            {message.type === "text" && (

                                <span>

                                    {message.text}

                                </span>

                            )}

                            {message.type === "image" && (

                                <ImageMessage
                                    image={message.image}
                                />

                            )}

                            {message.type === "file" && (

                                <FileMessage
                                    file={message.file}
                                    onOpen={onOpenPdf}
                                />

                            )}

                        </>

                    )}

                </div>

                {!(message.recalled || message.deleted) && (

                    <MessageReaction
                        reactions={
                            message.reactions
                        }
                    />

                )}

            </div>

            <MessageMeta
                message={message}
                isMine={isMine}
            />

        </div>

    );

}

export default Bubble;