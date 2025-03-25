import { format, parseISO, isValid } from "date-fns";

export default function Message({ message, userId }) {
  const isUser = message.sender.userId === userId;

  let formattedTime = "Sending...";
  try {
    if (typeof message.timeStamp === "string") {
      const parsedDate = parseISO(message.timeStamp);
      if (isValid(parsedDate)) {
        formattedTime = format(parsedDate, "dd/MM/yyyy p");
      }
    } else if (message.timeStamp instanceof Date) {
      formattedTime = format(message.timeStamp, "dd/MM/yyyy p");
    }
  } catch (error) {
    console.error("❌ Error parsing timeStamp:", error.message);
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div
        className={`relative p-3 max-w-xs rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
          isUser
            ? "bg-blue-700 text-white rounded-br-none hover:bg-blue-600"
            : "bg-gray-700 text-gray-200 rounded-bl-none hover:bg-gray-600"
        }`}
      >
        <p>{message.content}</p>
        <div className="text-xs text-gray-400 mt-1 text-right">{formattedTime}</div>
        </div>
    </div>
  );
}
