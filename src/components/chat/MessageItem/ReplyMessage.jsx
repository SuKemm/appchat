function ReplyMessage({
    reply,
}) {

    if (!reply) {

        return null;

    }

    return (

        <div className="reply-preview">

            <small>

                Trả lời

            </small>

            <p>

                {reply.type === "image"
                    ? "📷 Ảnh"
                    : reply.text}

            </p>

        </div>

    );

}

export default ReplyMessage;