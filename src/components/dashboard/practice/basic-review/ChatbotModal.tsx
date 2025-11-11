"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa6";
import Image from "next/image";

interface ChatMessageProps {
  sender: "user" | "bot";
  message: string;
  senderName?: string;
  shouldAnimate?: boolean;
}

function LoadingDots() {
  const [dots, setDots] = useState(".");
  
  useEffect(() => {
    let index = 0;
    const pattern = ["...", "..", ".", "..", "..."];
    
    const interval = setInterval(() => {
      setDots(pattern[index]);
      index = (index + 1) % pattern.length;
    }, 300);

    return () => clearInterval(interval);
  }, []);
  
  return <span>{dots}</span>;
}

function ChatMessage({ sender, message, senderName, shouldAnimate = false, onUpdate }: ChatMessageProps & { onUpdate?: () => void }) {
  const [displayedMessage, setDisplayedMessage] = useState(sender === "user" ? message : "");
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (sender === "bot" && shouldAnimate && !hasAnimated) {
      let index = 0;
      setDisplayedMessage("");
      
      const interval = setInterval(() => {
        if (index < message.length) {
          setDisplayedMessage(message.slice(0, index + 1));
          index++;
          if (onUpdate) onUpdate();
        } else {
          setHasAnimated(true);
          clearInterval(interval);
        }
      }, 20); 
      
      return () => clearInterval(interval);
    } else if (sender === "bot" && !shouldAnimate) {
      // If shouldn't animate, show full message immediately
      setDisplayedMessage(message);
      setHasAnimated(true);
    }
  }, []); 
  
  return (
    <div className={`flex gap-3 mb-4 ${sender === "user" ? "justify-start" : "justify-start"}`}>
      {sender === "user" ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center">
          <span className="text-white font-body text-sm">Y</span>
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue flex items-center justify-center overflow-hidden">
          <Image 
            src="/practice/chatbot-mascot.svg" 
            alt="Bot" 
            width={40} 
            height={40}
            className="w-[110%] h-[110%] object-contain object-top"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="font-body text-sm font-body text-gray-300 mb-1">
          {sender === "user" ? "You" : senderName || "Chika - AI"}
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
          <p className="text-black font-body text-base whitespace-pre-wrap">
            {displayedMessage}
          </p>
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
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; message: string; id: number; shouldAnimate: boolean }>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue;
      const newMessageId = messageIdCounter;
      setMessageIdCounter(prev => prev + 1);
      
      setShouldAutoScroll(true);
      
      setMessages(prev => [...prev, { sender: "user", message: userMessage, id: newMessageId, shouldAnimate: false }]);
      setInputValue("");
      setIsLoading(true);
      
      const history = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message
      }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            history: history,
          }),
        });

        const result = await res.json();
        
        setIsLoading(false);
        
        if (result.success && result.response) {
          const botMessageId = messageIdCounter + 1;
          setMessageIdCounter(prev => prev + 1);
          
          setMessages(prev => [...prev, { 
            sender: "bot", 
            message: result.response,
            id: botMessageId,
            shouldAnimate: true 
          }]);
        } else {
          console.error("Chatbot error:", result.error);
          const botMessageId = messageIdCounter + 1;
          setMessageIdCounter(prev => prev + 1);
          
          setMessages(prev => [...prev, { 
            sender: "bot", 
            message: "Sorry, I encountered an error. Please try again.",
            id: botMessageId,
            shouldAnimate: false
          }]);
        }
      } catch (error: any) {
        setIsLoading(false);
        console.error("Fetch error:", error);
        const botMessageId = messageIdCounter + 1;
        setMessageIdCounter(prev => prev + 1);
        
        setMessages(prev => [...prev, { 
          sender: "bot", 
          message: "Sorry, I encountered an error. Please try again.",
          id: botMessageId,
          shouldAnimate: false
        }]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation(); 
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

      <div className="relative bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl mx-4 z-10 flex flex-col h-[600px]"
          onKeyDown={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Image 
              src="/kanangkuan-logo.svg" 
              alt="Logo" 
              width={48} 
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="cursor-default text-xl sm:text-2xl font-main hover:text-lime transition-colors duration-300 ease-in-out">Kanang Kuan</h2>
          <button
            onClick={() => setShowModal(false)}
            className="cursor-pointer ml-auto w-10 h-10 flex items-center justify-center hover:text-black transition-colors duration-300 ease-in-out"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              sender={msg.sender} 
              message={msg.message}
              shouldAnimate={msg.shouldAnimate}
              onUpdate={scrollToBottom}
            />
          ))}
          
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden">
                <Image 
                  src="/practice/chatbot-mascot.svg" 
                  alt="Bot" 
                  width={40} 
                  height={40}
                  className="w-[110%] h-[110%] object-contain object-top"
                />
              </div>
              <div className="flex-1">
                <div className="font-body text-sm font-body text-gray-300 mb-1">
                  Chika 
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                  <p className="text-gray-400 font-body text-base">
                    Thinking<LoadingDots />
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-400 border-1 border-gray-300 rounded-full focus:outline-none focus:border-black transition-colors font-body disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-full bg-lime flex items-center justify-center text-white hover:bg-pink transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowUp className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}