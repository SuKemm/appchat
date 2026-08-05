import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import EmptyChat from "./EmptyChat";
import MessageItem from "./MessageItem";
import MessageSkeleton from "./MessageSkeleton";
import TypingIndicator from "./TypingIndicator";
import ForwardModal from "./ForwardModal";

import useEscapeToClose from "../../hooks/useEscapeToClose";

import {
    deleteMessageForMe,
} from "../../services/chat";

function MessageList({
    selectedUser,
    messages,
    currentUser,
    users = [],
    groups = [],
    otherTyping,
    conversationId,
    setReplyMessage,
    pinnedMessageIds = [],
    loading = false,
}) {

    const containerRef = useRef(null);
    const bottomRef = useRef(null);

    // Whether the user is currently scrolled near the bottom of the
    // thread. Kept in a ref (not state) because it's read from a
    // scroll handler on every frame and shouldn't trigger re-renders.
    const isNearBottomRef = useRef(true);

    const rafRef = useRef(null);

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [forwardMessage, setForwardMessage] = useState(null);

    // Messages this user chose to delete "only for me" are hidden
    // client-side, without affecting what anyone else sees.
    const visibleMessages = useMemo(() => (

        messages.filter(
            (item) => !(item.deletedFor || []).includes(currentUser?.uid),
        )

    ), [messages, currentUser]);

    const hasMessages = visibleMessages.length > 0;

    // Track whether the user is scrolled near the bottom, so new
    // messages only auto-scroll the view when that won't yank them
    // away from history they're actively reading. Passive + rAF
    // throttled so it never blocks the scroll thread.
    useEffect(() => {

        const node = containerRef.current;

        if (!node) {

            return;

        }

        const NEAR_BOTTOM_THRESHOLD = 120;

        const updateNearBottom = () => {

            rafRef.current = null;

            const distanceFromBottom =
                node.scrollHeight - node.scrollTop - node.clientHeight;

            isNearBottomRef.current =
                distanceFromBottom < NEAR_BOTTOM_THRESHOLD;

        };

        const handleScroll = () => {

            if (rafRef.current !== null) {

                return;

            }

            rafRef.current = requestAnimationFrame(updateNearBottom);

        };

        node.addEventListener("scroll", handleScroll, { passive: true });

        updateNearBottom();

        return () => {

            node.removeEventListener("scroll", handleScroll);

            if (rafRef.current !== null) {

                cancelAnimationFrame(rafRef.current);

            }

        };

    }, [conversationId]);

    // Jump to bottom instantly the moment a conversation is opened
    // (loading state flips or the id changes) — a smooth scroll
    // here would look like the whole thread sliding up, which reads
    // as janky rather than native.
    useEffect(() => {

        if (loading) {

            return;

        }

        bottomRef.current?.scrollIntoView({
            behavior: "auto",
        });

        isNearBottomRef.current = true;

    }, [conversationId, loading]);

    // Bấm vào ô nhập tin nhắn (TextInput, component anh em — xem
    // main.jsx không liên quan, event này chỉ trong phạm vi 1 lượt
    // trò chuyện) → luôn cuộn về tin nhắn mới nhất, giống Zalo/Messenger
    // thật, thay vì để người dùng gõ tin nhắn trong khi màn hình đang
    // dừng ở một đoạn lịch sử cũ.
    useEffect(() => {

        const handleInputFocused = () => {

            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });

            isNearBottomRef.current = true;

        };

        window.addEventListener("chat:input-focused", handleInputFocused);

        return () => {

            window.removeEventListener(
                "chat:input-focused",
                handleInputFocused,
            );

        };

    }, []);

    // New messages / typing indicator: only follow along smoothly
    // if the user was already near the bottom, so scrolling up to
    // read older messages never gets interrupted.
    useEffect(() => {

        if (!isNearBottomRef.current) {

            return;

        }

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [visibleMessages, otherTyping]);

    // Reset selection mode whenever the conversation changes.
    useEffect(() => {

        setSelectionMode(false);
        setSelectedIds([]);

    }, [conversationId]);

    const handleEnterSelectionMode = useCallback((startId) => {

        setSelectionMode(true);
        setSelectedIds([startId]);

    }, []);

    const handleToggleSelect = useCallback((id) => {

        setSelectedIds((current) =>

            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],

        );

    }, []);

    // Escape thoát chế độ chọn nhiều — đặt trước early-return bên
    // dưới vì hook phải luôn được gọi, không được gọi có điều kiện.
    useEscapeToClose(() => {

        setSelectionMode(false);
        setSelectedIds([]);

    }, selectionMode);

    if (!selectedUser) {
        return <EmptyChat />;
    }

    const handleCancelSelection = () => {

        setSelectionMode(false);
        setSelectedIds([]);

    };

    const handleBulkDelete = async () => {

        if (selectedIds.length === 0) {
            return;
        }

        if (
            !window.confirm(
                `Xóa ${selectedIds.length} tin nhắn này chỉ ở phía bạn?`,
            )
        ) {
            return;
        }

        setBulkBusy(true);

        try {

            await Promise.all(
                selectedIds.map((id) =>
                    deleteMessageForMe(conversationId, id, currentUser.uid),
                ),
            );

            handleCancelSelection();

        } catch (error) {

            console.error("Failed to bulk delete messages:", error);

        } finally {

            setBulkBusy(false);

        }

    };

    return (

        <section className="messages" ref={containerRef}>

            {selectionMode && (

                <div className="selection-bar">

                    <span>Đã chọn {selectedIds.length} tin nhắn</span>

                    <div className="selection-bar-actions">

                        <button
                            type="button"
                            className="selection-bar-btn danger"
                            disabled={bulkBusy || selectedIds.length === 0}
                            onClick={handleBulkDelete}
                        >
                            Xóa
                        </button>

                        <button
                            type="button"
                            className="selection-bar-btn"
                            onClick={handleCancelSelection}
                        >
                            Huỷ
                        </button>

                    </div>

                </div>

            )}

            {loading ? (

                <MessageSkeleton />

            ) : !hasMessages ? (

                <div className="empty-chat">

                    <h3>Chưa có tin nhắn</h3>

                    <p>

                        Hãy gửi lời chào đầu tiên 👋

                    </p>

                </div>

            ) : (

                visibleMessages.map((message) => (

                    <MessageItem
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                        users={users}
                        conversationId={conversationId}
                        setReplyMessage={setReplyMessage}
                        pinnedMessageIds={pinnedMessageIds}
                        selectionMode={selectionMode}
                        selected={selectedIds.includes(message.id)}
                        onToggleSelect={handleToggleSelect}
                        onEnterSelectionMode={handleEnterSelectionMode}
                        onForward={setForwardMessage}
                    />

                ))

            )}

            {otherTyping && (

                <TypingIndicator />

            )}

            <div ref={bottomRef} />

            <ForwardModal
                message={forwardMessage}
                user={currentUser}
                users={users}
                groups={groups}
                onClose={() => setForwardMessage(null)}
            />

        </section>

    );

}

export default MessageList;
