import React, { useState, useRef, useEffect } from "react";
import { Send, Users, User, X, MessageSquareText } from "lucide-react";

const ChatPanel = ({ wsConnection, userId, mainScene }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "chat":
          setMessages((prev) => [...prev, message.payload]);
          break;
      }
    };

    wsConnection.addEventListener("message", handleMessage);

    return () => {
      wsConnection.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const chatMessage = {
      type: "chat",
      payload: {
        message: message.trim(),
        targetUsers:
          selectedUsers.length > 0
            ? selectedUsers.map((user) => user.userId) // Extract just the IDs for sending
            : undefined,
      },
    };

    wsConnection?.send(JSON.stringify(chatMessage));
    setMessage("");
  };

  const getActiveUsers = () => {
    const users =
      mainScene?.children?.filter(
        (user) => user.userId && user.userId !== userId
      ) || [];

    return users;
  };

  const toggleUserSelection = (targetUser) => {
    setSelectedUsers((prev) =>
      prev.some((user) => user.userId === targetUser.userId)
        ? prev.filter((user) => user.userId !== targetUser.userId)
        : [...prev, targetUser]
    );
  };

  const MessageBubble = ({ msg }) => {
    const isOwnMessage = msg.userId === userId;
    const isSystemMessage = msg.userId === "system";
    const isPrivateMessage = msg.targetUsers?.length > 0;

    return (
      <div
        className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex flex-col ${
            isOwnMessage ? "items-end" : "items-start"
          } max-w-[80%]`}
        >
          {!isOwnMessage && !isSystemMessage && (
            <div className="ml-1 text-xs text-gray-300 mb-1 flex items-center gap-2">
              <span className="font-semibold">{msg.username}</span>
              <span className="text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <div
            className={`px-4 py-2 bg-second rounded-2xl shadow-xl ${
              isOwnMessage
                ? "bg-third text-white"
                : isSystemMessage
                  ? "italic"
                  : ""
            }`}
          >
            {isPrivateMessage && (
              <span className="text-xs italic text-gray-300 block mb-1">
                Whispered
              </span>
            )}
            <span className="text-sm">{msg.message}</span>
          </div>

          {isOwnMessage && (
            <div className="text-xs text-gray-400 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 text-white bg-black bg-opacity-50 rounded-lg transition-all ">
        {localStorage.getItem("username")}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white bg-black bg-opacity-50 rounded-lg transition-all hover:bg-opacity-60"
      >
        <MessageSquareText size={20} />
        <span>Chat</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-black bg-opacity-50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex flex-col h-96">
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="bg-third text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="hover:text-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto mb-4 hide-scrollbar scroll-smooth">
              {messages.map((msg, index) => (
                <MessageBubble key={index} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="bg-gray-700 px-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {selectedUsers.length > 0 ? (
                    <Users size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </button>
                <form onSubmit={handleSend} className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 text-sm bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-third"
                    placeholder={
                      selectedUsers.length > 0
                        ? "Send private message..."
                        : "Send message..."
                    }
                  />
                  <button
                    type="submit"
                    className="bg-third text-white px-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              {showUserList && (
                <div className="bg-gray-800 rounded-lg mt-2 max-h-32 overflow-y-auto">
                  {getActiveUsers().map((user) => (
                    <button
                      key={user.userId}
                      onClick={() =>
                        toggleUserSelection({
                          userId: user.userId,
                          username: user.username,
                        })
                      }
                      className={`w-full px-3 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 ${
                        selectedUsers.some(
                          (selected) => selected.userId === user.userId
                        )
                          ? "bg-gray-700"
                          : ""
                      }`}
                    >
                      <User size={14} />
                      <span className="text-sm">{user.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
