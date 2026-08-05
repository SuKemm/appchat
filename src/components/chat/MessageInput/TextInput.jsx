function TextInput({
    selectedUser,
    message,
    setMessage,
    sendMessage,
}) {

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    };

    // Bấm vào ô nhập luôn đưa cuộc trò chuyện về tin nhắn mới nhất —
    // đúng hành vi Zalo/Messenger thật, kể cả khi trước đó người dùng
    // đang cuộn lên xem tin nhắn cũ. MessageList lắng nghe event này
    // (2 component là anh em, không tiện truyền ref/prop xuyên App.jsx).
    const handleFocus = () => {

        window.dispatchEvent(new Event("chat:input-focused"));

    };

    return (

        <input
            type="text"
            value={message}
            disabled={!selectedUser}
            placeholder={
                selectedUser
                    ? "Nhập tin nhắn..."
                    : "Hãy chọn một tài khoản"
            }
            onChange={(event) =>
                setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
        />

    );

}

export default TextInput;