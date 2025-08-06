import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoSend } from "react-icons/io5";

interface AiHelpSidebarProps {
  onClose: () => void;
}

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AiHelpSidebar({ onClose }: AiHelpSidebarProps) {
  const [inputValue, setInputValue] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setChat((prev) => [...prev, { role: "user", text: userMessage }]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setChat((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "No response" },
      ]);
    } catch (err) {
      console.error("AI fetch error:", err);
      setChat((prev) => [
        ...prev,
        { role: "ai", text: " Error getting response from AI" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed top-[55px] lg:right-0 md:right-0 sm:right-0 lg:w-[320px] md:w-[320px] sm:w-[320px] w-full h-[calc(100vh-55px)] bg-white z-50 flex flex-col rounded-bl-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-teal-600">
        <p className="text-white font-semibold text-lg">AI Assistance</p>
        <RxCross2 className="text-white hover:text-red-500 cursor-pointer" onClick={onClose} />
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 text-sm text-gray-700 overflow-y-auto space-y-4 bg-white relative">
       
        {chat.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center  text-gray-400">
              <p className="text-lg font-medium">How can I help you today?</p>
              <p className="text-sm mt-1">
                Ask me anything related to your project.
              </p>
            </div>
          </div>
        )}



        {/* Chat messages */}
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap p-3 rounded-md text-sm leading-relaxed shadow ${
              msg.role === "user"
                ? "bg-teal-100 text-black self-end"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <b className="block mb-1">{msg.role === "user" ? "You" : "AI"}:</b>

            {msg.text.includes("```") ? (
              msg.text.split("```").map((block, i) =>
                i % 2 === 0 ? (
                  <p key={i} className="mb-2">
                    {block.trim()}
                  </p>
                ) : (
                  <pre
                    key={i}
                    className="bg-black text-white text-xs rounded-md p-3 overflow-auto shadow-inner"
                  >
                    <code>{block.trim()}</code>
                  </pre>
                )
              )
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
        ))}

       
        {loading && (
          <p className="text-xs italic text-gray-400 animate-pulse">
            Thinking...
          </p>
        )}
      </div>

   
      <div className="px-4 py-3 border-t flex items-center gap-2 bg-white shadow-inner">
        <input
          type="text"
          placeholder="Ask AI..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-10 px-4 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="h-10 px-4 flex items-center justify-center bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 transition"
        >
          <IoSend size={18} />
        </button>
      </div>
    </div>
  );
}
