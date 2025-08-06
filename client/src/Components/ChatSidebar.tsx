"use client";

import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Socket } from "socket.io-client";

interface ChatSidebarProps {
  onClose: () => void;
  messages: { sender: string; text: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ sender: string; text: string }[]>>;
  socket: Socket | null;
  sessionId: string;
}

export default function ChatSidebar({
  onClose,
  messages,
  setMessages,
  socket,
  sessionId,
}: ChatSidebarProps) {
  const [message, setMessage] = useState<string>("");
  const [userName, setUserName] = useState<string>("You");

  useEffect(() => {
  
    socket?.on("your-name", (name: string) => {
      setUserName(name);
    });



    return () => {
      socket?.off("your-name");
      socket?.off("chat-message");
    };
  }, [socket, setMessages]);

  const handleSend = () => {
    if (!message.trim()) return;

    
    socket?.emit("chat-message", {
      sessionId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="fixed top-[55px] lg:right-0 md:right-0 sm:right-0 lg:w-[320px] md:w-[320px] sm:w-[320px] w-full h-[calc(100vh-55px)] bg-white z-50 flex flex-col rounded-bl-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-teal-600">
        <p className="text-white font-semibold text-lg">Chat</p>
        <RxCross2 className="text-white cursor-pointer hover:text-red-500" onClick={onClose} />
      </div>

    
      <div className="flex-1 overflow-y-auto px-4 py-2 text-sm text-gray-700">
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages yet.</p>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.sender === userName;
            return (
              <div
                key={idx}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg shadow-md text-sm ${
                    isCurrentUser
                      ? "bg-teal-500 text-white rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  <span className="font-semibold mr-1">{msg.sender}:</span>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

     
      <div className="px-3 py-2 shadow-inner rounded-bl-3xl">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
