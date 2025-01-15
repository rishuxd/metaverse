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
      console.log(event?.data);
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
        targetUsers: selectedUsers.length > 0 ? selectedUsers : undefined,
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

  const toggleUserSelection = (targetUserId) => {
    setSelectedUsers((prev) =>
      prev.includes(targetUserId)
        ? prev.filter((id) => id !== targetUserId)
        : [...prev, targetUserId]
    );
  };

  const MessageBubble = ({ msg }) => {
    const isOwnMessage = msg.userId === userId;
    const isSystemMessage = msg.userId === "system";
    const isPrivateMessage = msg.targetUsers?.length > 0;

    return (
      <div className={`mb-2 ${isOwnMessage ? "text-right" : ""}`}>
        <div
          className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
            isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
          } ${isSystemMessage ? "bg-gray-500 italic text-sm" : ""}`}
        >
          {!isOwnMessage && !isSystemMessage && (
            <div className="text-xs text-gray-300 mb-1">{msg.userId}</div>
          )}
          <div className="text-sm">
            {isPrivateMessage && (
              <span className="text-xs italic text-gray-300 mb-1 block">
                Wishperd
              </span>
            )}
            {msg.message}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-2 right-2 flex gap-2">
      <button
        onClick={() => setIsOpen(!isOpen) && scrollToBottom()}
        className="flex items-center gap-2 p-3 text-white bg-black bg-opacity-50 rounded-lg transition-all hover:bg-opacity-60"
      >
        <MessageSquareText size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-black bg-opacity-50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex flex-col h-96">
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((userId) => (
                  <div
                    key={userId}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{userId}</span>
                    <button
                      onClick={() => toggleUserSelection(userId)}
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
                    className="flex-1 text-sm bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      selectedUsers.length > 0
                        ? "Send private message..."
                        : "Send message..."
                    }
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 rounded-lg hover:bg-blue-600 transition-colors"
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
                      onClick={() => toggleUserSelection(user.userId)}
                      className={`w-full px-3  py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 ${
                        selectedUsers.includes(user.userId) ? "bg-gray-700" : ""
                      }`}
                    >
                      <User size={14} />
                      <span className="text-sm">{user.userId}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
