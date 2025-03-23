import { useState, useEffect } from "react";
import { sendMessage, fetchChat } from "@/app/_utils/GlobalApi";
import Message from "./Message";

export default function ChatBox({ chat, matchId, userId }) {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isPolling, setIsPolling] = useState(true); // ✅ Control polling

  // ✅ Fetch latest messages periodically
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        //console.log("🔄 Polling for new messages...");
        const updatedChat = await fetchChat(matchId);

        if (updatedChat?.messages) {
          const latestMessages = updatedChat.messages;

          // ✅ Only update if new messages exist
          if (JSON.stringify(latestMessages) !== JSON.stringify(messages)) {
            //console.log("📩 New messages found! Updating chat...");
            setMessages(latestMessages);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    // Start polling every 5 seconds
    if (isPolling) {
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval); // Cleanup on unmount
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
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-100">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => <Message key={index} message={msg} userId={userId} />)
        )}
      </div>

      {/* Chat Input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-slate-600 text-white rounded-md"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
