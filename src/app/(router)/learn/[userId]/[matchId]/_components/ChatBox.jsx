import { useState, useEffect } from "react";
import { sendMessage, fetchChat } from "@/app/_utils/GlobalApi";
import Message from "./Message";

export default function ChatBox({ chat, matchId, userId }) {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isPolling, setIsPolling] = useState(true);

  // ✅ Fetch latest messages periodically
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const updatedChat = await fetchChat(matchId);
        if (updatedChat?.messages) {
          const latestMessages = updatedChat.messages;
          if (JSON.stringify(latestMessages) !== JSON.stringify(messages)) {
            setMessages(latestMessages);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    if (isPolling) {
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [matchId, messages, isPolling]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await sendMessage(matchId, userId, newMessage);
    if (success) {
      setMessages([...messages, { content: newMessage, sender: { userId }, timeStamp: new Date() }]);
      setNewMessage("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] shadow-lg rounded-lg p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 border border-black rounded-lg bg-[#161b27] shadow-md">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => <Message key={index} message={msg} userId={userId} />)
        )}
      </div>

      {/* Chat Input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border border-black bg-[#161b27] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="group flex items-center justify-center gap-3 px-4 py-2 text-[18px] text-gray-400 bg-[#0b0f19] rounded-md transition-all ease-in-out duration-300 hover:bg-[#161b27] hover:text-gray-200 hover:shadow-lg hover:shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
        >
          <span className="hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            Send
          </span>
        </button>
      </div>
    </div>
  );
}
