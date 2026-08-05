import {
    useMemo,
    useRef,
    useState,
} from "react";

import { UploadCloud } from "lucide-react";


// ==========================
// Hooks
// ==========================

import useAuth from "./hooks/auth/useAuth";

import useUsers from "./hooks/users/useUsers";

import useGroups from "./hooks/chat/useGroups";

import useDirectConversations from "./hooks/chat/useDirectConversations";

import useConversationList from "./hooks/chat/useConversationList";

import useUnreadCounts from "./hooks/chat/useUnreadCounts";

import useMessages from "./hooks/chat/useMessages";

import useChat from "./hooks/chat/useChat";

import usePresence from "./hooks/users/usePresence";

import useTyping from "./hooks/chat/useTyping";

import useSeen from "./hooks/chat/useSeen";


// ==========================
// Services
// ==========================

import {
    updateUserStatus,
} from "./services/users/usersService";


import {
    unpinMessage,
} from "./services/chat";


import {
    logout,
} from "./services/auth/authService";


// ==========================
// Pages
// ==========================

import Login from "./pages/Login";


// ==========================
// Components
// ==========================

import Sidebar from "./components/sidebar/Sidebar";

import ChatHeader from "./components/chat/ChatHeader";

import MessageList from "./components/chat/MessageList";

import MessageInput from "./components/chat/MessageInput";

import ConversationInfoModal from "./components/chat/ConversationInfoModal";

import CreateGroupModal from "./components/sidebar/CreateGroupModal";

import Skeleton from "./components/common/Skeleton";

import ConversationSkeleton from "./components/sidebar/ConversationSkeleton";

import MessageSkeleton from "./components/chat/MessageSkeleton";


// ==========================
// Styles
// ==========================

import "./styles/variables.css";

import "./styles/animations.css";

import "./styles/global.css";

import "./styles/layout.css";

import "./styles/sidebar.css";

import "./styles/message.css";

import "./styles/messageMenu.css";

import "./styles/input.css";

import "./styles/actionSheet.css";

import "./styles/groupModal.css";

import "./styles/login.css";

import "./styles/responsive.css";

import "./styles/groupPanel.css";

import "./styles/skeleton.css";

function App() {

    // =========================
    // AUTH
    // =========================

    const {
        user,
        loading,
        setUser,
    } = useAuth();

    usePresence(user?.uid);

    const [error, setError] =
        useState("");
    const clearError = () => {
        setError("");
    };
    // =========================
    // USERS
    // =========================

    const {
        users,
        setUsers,
        loading: usersLoading,
    } = useUsers(
        user,
        setError
    );

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);

    // =========================
    // GROUPS
    // =========================

    const {
        groups,
        loading: groupsLoading,
    } = useGroups(
        user,
        setError
    );

    const selectedGroupId =
        selectedUser?.isGroup
            ? selectedUser.uid
            : null;

    const currentGroup =
        selectedGroupId
            ? groups.find((item) => item.id === selectedGroupId) || null
            : null;

    const [showConversationInfo, setShowConversationInfo] =
        useState(false);

    // ---- Drag & Drop tệp (state) ----
    // Khai báo NGAY Ở ĐÂY — trước 2 chỗ `return` sớm phía dưới (màn
    // hình skeleton lúc `loading` và màn hình Login lúc `!user`) — vì
    // React bắt buộc mọi hook phải được gọi theo đúng thứ tự ở MỌI
    // lần render, không được đặt sau 1 điều kiện return. Đặt sai chỗ
    // này trước đây gây đúng lỗi "Rules of Hooks" (đổi thứ tự hook
    // giữa lúc còn đang loading/chưa đăng nhập và lúc vào được màn
    // hình chat chính) mà DevTools console báo.
    const dragDepthRef =
        useRef(0);

    const [isDraggingFile, setIsDraggingFile] =
        useState(false);

    const messageInputRef =
        useRef(null);

    // When a group has "Chỉ trưởng/phó nhóm được nhắn tin" enabled,
    // only the owner (trưởng nhóm) and admins (phó nhóm) may send.
    // Direct chats and groups without the restriction are unaffected.
    const isBlockedInConversation =
        Boolean(
            selectedUser?.isGroup &&
            currentGroup?.blockedMembers?.includes(user?.uid),
        );

    const canSendInConversation =
        !isBlockedInConversation &&
        (
            !selectedUser?.isGroup ||
            !currentGroup?.onlyAdminsCanSend ||
            currentGroup?.owner === user?.uid ||
            Boolean(currentGroup?.admins?.includes(user?.uid))
        );

    // =========================
    // DIRECT CONVERSATIONS
    // =========================

    const {
        directConversations,
        loading: directConversationsLoading,
    } = useDirectConversations(
        user,
        setError
    );

    // Sidebar shows a skeleton until every source feeding the
    // unified conversation list has returned its first snapshot.
    const conversationListLoading =
        usersLoading ||
        groupsLoading ||
        directConversationsLoading;

    // The direct (1-1) conversation doc matching the currently
    // selected contact, if it already exists (it's created lazily
    // on the first message, so it may be null for a brand new
    // contact with no messages yet).
    const currentDirectConversation =
        (!selectedUser?.isGroup && selectedUser)
            ? directConversations.find(
                (item) => item.participants?.includes(selectedUser.uid),
            ) || null
            : null;

    // Seed member ids for CreateGroupModal when it's opened from the
    // "Tạo nhóm trò chuyện" button inside a 1-1 conversation's info panel.
    const [createGroupSeed, setCreateGroupSeed] =
        useState(null);

    // =========================
    // UNIFIED CONVERSATION LIST
    // =========================
    // Merges groups + direct chats + contacts without a
    // chat yet into a single Zalo-style, sorted list.

    const {
        items: conversationItems,
        usersById,
    } = useConversationList(
        user,
        users,
        groups,
        directConversations,
    );

    const handleSelectConversation = (item) => {

        if (item.isGroup) {

            const group =
                item.conversation;

            setSelectedUser({

                isGroup: true,

                uid: group.id,

                displayName: group.groupName,

                groupAvatar: group.groupAvatar,

                email: `${group.participantCount ?? group.participants?.length ?? 0} thành viên`,

                online: false,

            });

        } else {

            setSelectedUser(item.otherUser);

        }

        clearError();

    };

    // =========================
    // CHAT
    // =========================

    const {
        conversationId,
        message,
        setMessage,
        sendMessage,
        replyMessage,
        setReplyMessage,
    } = useChat(
        user,
        selectedUser,
        setError
    );

    // =========================
    // UNREAD BADGES
    // =========================

    const unreadCounts =
        useUnreadCounts(
            user?.uid,
            conversationItems,
            conversationId,
        );

    // =========================
    // MESSAGES
    // =========================

    const {
        messages,
        setMessages,
        loading: messagesLoading,
    } = useMessages(
        conversationId,
        setError
    );

    // =========================
    // PINNED MESSAGES
    // =========================
    // Nguồn dữ liệu duy nhất, dùng chung bởi ChatHeader (dòng "đã
    // ghim" tích hợp trong header) và MessageList (đánh dấu từng
    // dòng tin đang được ghim) — tránh tính trùng ở 2 nơi.

    const pinnedMessageIds =
        (selectedUser?.isGroup
            ? currentGroup?.pinnedMessageIds
            : currentDirectConversation?.pinnedMessageIds) || [];

    const pinnedMessages = useMemo(() => (

        pinnedMessageIds
            .map((id) => messages.find((item) => item.id === id))
            .filter(Boolean)

    ), [pinnedMessageIds, messages]);

    const handleUnpinMessage = async (messageId) => {

        try {

            await unpinMessage(conversationId, messageId);

        } catch (err) {

            console.error("Failed to unpin message:", err);

        }

    };

    // =========================
    // SEEN
    // =========================

    useSeen(
        messages,
        conversationId,
        user
    );

    // =========================
    // TYPING
    // =========================

    const {
        setTyping,
        otherTyping,
    } = useTyping(
        conversationId,
        user,
        selectedUser
    );

    // =========================
    // LOGOUT
    // =========================
    const resetAppState = () => {

        setUsers([]);

        setSelectedUser(null);

        setMessages([]);

        setMessage("");

        clearError();

    };
    const handleLogout = async () => {

        try {

            if (user) {

                await updateUserStatus(
                    user.uid,
                    false
                );

            }

            await logout();

            resetAppState();

        } catch (err) {

            console.error(err);

            setError("Đăng xuất thất bại.");

        }

    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="app app-skeleton" aria-hidden="true">

                <aside className="sidebar">

                    <div className="skeleton-header">

                        <Skeleton
                            circle
                            width="var(--avatar-md)"
                            height="var(--avatar-md)"
                        />

                        <Skeleton
                            width="35%"
                            height=".875rem"
                        />

                    </div>

                    <ConversationSkeleton />

                </aside>

                <main className="main-content">

                    <section className="chat">

                        <header className="chat-header">

                            <div className="skeleton-header">

                                <Skeleton
                                    circle
                                    width="var(--avatar-md)"
                                    height="var(--avatar-md)"
                                />

                                <Skeleton
                                    width="8rem"
                                    height=".875rem"
                                />

                            </div>

                        </header>

                        <div className="messages">

                            <MessageSkeleton />

                        </div>

                    </section>

                </main>

            </div>
        );

    }

    // =========================
    // LOGIN
    // =========================

    if (!user) {

        return (

            <Login
                onLogin={setUser}
            />

        );

    }

    // =========================
    // UI
    // =========================

    // ---- Drag & Drop tệp ----
    // Kéo file từ ngoài hệ điều hành thả vào bất kỳ đâu trong khung
    // chat (header/danh sách tin nhắn/thanh nhập đều tính) đều nhận,
    // giống Zalo/Messenger — không chỉ bắt riêng thanh nhập tin nhắn.
    // `dragDepth` đếm số lần dragenter/dragleave lồng nhau (bắt buộc
    // phải đếm vì con cháu trong khung chat cũng phát sinh sự kiện
    // dragenter/dragleave liên tục khi rê chuột qua) — overlay chỉ ẩn
    // khi đếm về 0.

    const canDropFile =
        Boolean(selectedUser) && canSendInConversation;

    const handleChatDragEnter = (event) => {

        if (!canDropFile) return;

        if (!event.dataTransfer?.types?.includes("Files")) return;

        event.preventDefault();

        dragDepthRef.current += 1;

        setIsDraggingFile(true);

    };

    const handleChatDragOver = (event) => {

        if (!canDropFile) return;

        if (!event.dataTransfer?.types?.includes("Files")) return;

        event.preventDefault();

    };

    const handleChatDragLeave = (event) => {

        if (!canDropFile) return;

        event.preventDefault();

        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

        if (dragDepthRef.current === 0) {

            setIsDraggingFile(false);

        }

    };

    const handleChatDrop = (event) => {

        if (!canDropFile) return;

        event.preventDefault();

        dragDepthRef.current = 0;

        setIsDraggingFile(false);

        const droppedFile =
            event.dataTransfer?.files?.[0];

        if (droppedFile) {

            messageInputRef.current?.acceptDroppedFile(droppedFile);

        }

    };

    return (

        <div className={`app ${selectedUser ? "chat-open" : ""}`}>

            <Sidebar
                user={user}
                users={users}
                items={conversationItems}
                usersById={usersById}
                unreadCounts={unreadCounts}
                selectedUser={selectedUser}
                onSelectConversation={handleSelectConversation}
                clearError={clearError}
                onUserUpdated={(updatedUser) =>
                    setUser((current) => ({
                        ...current,
                        ...updatedUser,
                    }))
                }
                onLogout={handleLogout}
                loading={conversationListLoading}
            />

            <main className="main-content">

                <section
                    className={`chat ${isDraggingFile ? "chat-drag-active" : ""}`}
                    onDragEnter={handleChatDragEnter}
                    onDragOver={handleChatDragOver}
                    onDragLeave={handleChatDragLeave}
                    onDrop={handleChatDrop}
                >

                    <ChatHeader
                        selectedUser={selectedUser}
                        otherTyping={otherTyping}
                        onOpenConversationInfo={() => setShowConversationInfo(true)}
                        onBack={() => setSelectedUser(null)}
                        pinnedMessages={pinnedMessages}
                        onUnpinMessage={handleUnpinMessage}
                    />

                    {error && (
                        <div className="app-error">
                            {error}
                        </div>
                    )}

                    <MessageList
                        selectedUser={selectedUser}
                        messages={messages}
                        currentUser={user}
                        users={users}
                        groups={groups}
                        otherTyping={otherTyping}
                        conversationId={conversationId}
                        setReplyMessage={setReplyMessage}
                        pinnedMessageIds={pinnedMessageIds}
                        loading={messagesLoading}
                    />

                    <MessageInput
                        ref={messageInputRef}
                        selectedUser={selectedUser}
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                        conversationId={conversationId}
                        currentUser={user}
                        setTyping={setTyping}
                        replyMessage={replyMessage}
                        setReplyMessage={setReplyMessage}
                        setError={setError}
                        canSend={canSendInConversation}
                        isBlocked={isBlockedInConversation}
                    />

                    {isDraggingFile && (

                        <div className="chat-dropzone-overlay">

                            <div className="chat-dropzone-card">

                                <UploadCloud size={32} />

                                <span>Thả tệp vào đây để gửi</span>

                            </div>

                        </div>

                    )}

                </section>

            </main>

            {showConversationInfo && selectedUser && (

                <ConversationInfoModal
                    user={user}
                    isGroup={Boolean(selectedUser.isGroup)}
                    group={selectedUser.isGroup ? currentGroup : null}
                    directUser={selectedUser.isGroup ? null : selectedUser}
                    directConversation={currentDirectConversation}
                    conversationId={conversationId}
                    users={users}
                    groups={groups}
                    messages={messages}
                    onClose={() => setShowConversationInfo(false)}
                    onLeft={() => {
                        setSelectedUser(null);
                        setShowConversationInfo(false);
                    }}
                    onMerged={() => {
                        setShowConversationInfo(false);
                    }}
                    onCreateGroupFromContact={(uid) => {
                        setCreateGroupSeed([uid]);
                        setShowConversationInfo(false);
                    }}
                />

            )}

            {createGroupSeed && (

                <CreateGroupModal
                    user={user}
                    users={users}
                    initialSelectedIds={createGroupSeed}
                    onClose={() => setCreateGroupSeed(null)}
                    onCreated={(group) => {
                        setCreateGroupSeed(null);
                        handleSelectConversation({
                            isGroup: true,
                            conversation: group,
                        });
                    }}
                />

            )}

        </div>

    );

}

export default App;