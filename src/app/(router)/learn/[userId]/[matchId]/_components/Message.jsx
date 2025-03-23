import { format, parseISO, isValid } from "date-fns";

export default function Message({ message, userId }) {
  const isUser = message.sender.userId === userId;

  //console.log("📡 Stored timeStamp:", message.timeStamp); // Debugging log

  let formattedTime = "Sending..."; // Default fallback

  try {
    if (typeof message.timeStamp === "string") {
      const parsedDate = parseISO(message.timeStamp); // Parse if string
      if (isValid(parsedDate)) {
        formattedTime = format(parsedDate, "dd/MM/yyyy p"); // Converts to local time
      } else {
        console.error("❌ Invalid parsed date:", parsedDate);
      }
    } else if (message.timeStamp instanceof Date) {
      formattedTime = format(message.timeStamp, "dd/MM/yyyy p"); // Directly format Date object
    } else {
      console.error("❌ Unexpected timeStamp format:", message.timeStamp);
    }
  } catch (error) {
    console.error("❌ Error parsing timeStamp:", error.message);
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`p-2 rounded-lg max-w-xs ${isUser ? "bg-slate-500 text-white" : "bg-gray-300"}`}>
        <p>{message.content}</p>
        <span className="text-xs text-gray-500 block mt-1">{formattedTime}</span>
      </div>
    </div>
  );
}
