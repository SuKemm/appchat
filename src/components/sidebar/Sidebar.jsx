import { useCallback, useState } from "react";

import { Search, X, Sun, Moon } from "lucide-react";

import CurrentUser from "./CurrentUser";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "./ConversationSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import ProfileModal from "./ProfileModal";

import useTheme from "../../hooks/useTheme";

function Sidebar({
    user,
    users,
    items = [],
    usersById,
    unreadCounts = {},
    selectedUser,
    onSelectConversation,
    clearError,
    onUserUpdated,
    onLogout,
    loading = false,
}) {

    const { isDark, toggleTheme } =
        useTheme();

    const [showCreateGroup, setShowCreateGroup] =
        useState(false);

    const [showProfile, setShowProfile] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState("");

    const normalizedSearch =
        searchTerm.trim().toLowerCase();

    const handleSelect = useCallback((item) => {

        onSelectConversation(item);
        clearError();

    }, [onSelectConversation, clearError]);

    const matchesSearch = (item) => {

        if (!normalizedSearch) {

            return true;

        }

        const name =
            item.isGroup
                ? (item.conversation?.groupName || "Nhóm chưa đặt tên")
                : (item.otherUser?.displayName || "");

        const email =
            item.isGroup
                ? ""
                : (item.otherUser?.email || "");

        return (
            name.toLowerCase().includes(normalizedSearch) ||
            email.toLowerCase().includes(normalizedSearch)
        );

    };

    const filteredItems =
        items.filter(matchesSearch);

    const isItemActive = (item) => {

        if (item.isGroup) {

            return (
                Boolean(selectedUser?.isGroup) &&
                selectedUser?.uid === item.conversation?.id
            );

        }

        return (
            !selectedUser?.isGroup &&
            Boolean(selectedUser) &&
            selectedUser?.uid === item.otherUser?.uid
        );

    };

    const getUnreadCount = (item) => {

        if (!item.id) {

            return 0;

        }

        return unreadCounts[item.id] || 0;

    };

    return (

        <aside className="sidebar">

            {/* Header */}

            <header className="sidebar-header">

                <h2>Chats</h2>

                <div className="sidebar-header-actions">

                    <button
                        type="button"
                        className="create-group-button"
                        title="Tạo nhóm"
                        onClick={() => setShowCreateGroup(true)}
                    >
                        + Nhóm
                    </button>

                    <button
                        type="button"
                        className="theme-toggle-button"
                        title={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
                        aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
                        onClick={toggleTheme}
                    >

                        {isDark ? <Sun size={16} /> : <Moon size={16} />}

                    </button>

                    <button
                        type="button"
                        className="logout-button"
                        title="Đăng xuất"
                        onClick={onLogout}
                    >

                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>

                    </button>

                </div>

            </header>

            {/* Search */}

            <div className="sidebar-search">

                <Search size={16} className="sidebar-search-icon" />

                <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={(event) =>
                        setSearchTerm(event.target.value)
                    }
                />

                {searchTerm && (

                    <button
                        type="button"
                        className="sidebar-search-clear"
                        title="Xoá tìm kiếm"
                        onClick={() => setSearchTerm("")}
                    >
                        <X size={14} />
                    </button>

                )}

            </div>

            {/* Current User */}

            <CurrentUser
                user={user}
                onClick={() => setShowProfile(true)}
            />

            {/* Unified Conversation List */}

            <div className="conversation-list">

                {loading ? (

                    <ConversationSkeleton />

                ) : filteredItems.length === 0 ? (

                    <div className="no-users">
                        {normalizedSearch
                            ? "Không tìm thấy hội thoại phù hợp"
                            : "Chưa có hội thoại nào"}
                    </div>

                ) : (

                    filteredItems.map((item) => (

                        <ConversationItem
                            key={item.key}
                            item={item}
                            currentUser={user}
                            usersById={usersById}
                            active={isItemActive(item)}
                            unreadCount={getUnreadCount(item)}
                            onSelect={handleSelect}
                        />

                    ))

                )}

            </div>

            {showCreateGroup && (

                <CreateGroupModal
                    user={user}
                    users={users}
                    onClose={() => setShowCreateGroup(false)}
                    onCreated={(group) =>
                        onSelectConversation({
                            isGroup: true,
                            conversation: group,
                        })
                    }
                />

            )}

            {showProfile && (

                <ProfileModal
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdated={onUserUpdated}
                />

            )}

        </aside>

    );

}

export default Sidebar;
