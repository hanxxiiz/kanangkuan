"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa6";
import Image from "next/image";

interface ChatMessageProps {
  sender: "user" | "bot";
  message: string;
  senderName?: string;
}

function ChatMessage({ sender, message, senderName }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 mb-4 ${sender === "user" ? "justify-start" : "justify-start"}`}>
      {sender === "user" ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center">
          <span className="text-white font-body text-sm">Y</span>
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <Image 
            src="/practice/chatbot-mascot.svg" 
            alt="Bot" 
            width={40} 
            height={40}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="font-body text-sm font-body text-gray-300 mb-1">
          {sender === "user" ? "You" : senderName || "Chika - AI"}
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
          <p className="text-black font-body text-base whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface ChatbotModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export default function ChatbotModal({ 
  showModal, 
  setShowModal,
}: ChatbotModalProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; message: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { sender: "user", message: inputValue }]);
      setInputValue("");
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: "bot", 
          message: "Lagi oi sig pangutana" 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
        onClick={() => setShowModal(false)}
      />

      <div className="relative bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl mx-4 z-10 flex flex-col" style={{ height: "600px" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center">
            <Image 
              src="/kanangkuan-logo.png" 
              alt="Logo" 
              width={48} 
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="cursor-default text-2xl font-main font-semibold hover:text-pink transition-colors duration-300 ease-in-out">Kanang Kuan</h2>
          <button
            onClick={() => setShowModal(false)}
            className="cursor-pointer ml-auto w-10 h-10 flex items-center justify-center hover:text-black transition-colors duration-300 ease-in-out"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index} 
              sender={msg.sender} 
              message={msg.message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question"
              className="flex-1 px-4 py-3 text-gray-400 border-1 border-gray-300 rounded-full focus:outline-none focus:border-black transition-colors font-body"
            />
            <button
              onClick={handleSend}
              className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-lime transition-colors duration-300 ease-in-out"
            >
              <FaArrowUp className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}