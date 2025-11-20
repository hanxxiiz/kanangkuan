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
  userProfilePic?: string | null; 
  onUpdate?: () => void;
  onAnimationComplete?: () => void; 
}

interface Message {
  sender: "user" | "bot";
  message: string;
  id: number;
  shouldAnimate: boolean;
}

interface ChatbotModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cardFront?: string;
  cardBack?: string;
  hasKeys?: boolean; 
  userProfilePic?: string | null; 
}

const MAX_FOLLOWUP_QUESTIONS = 2;
const ANIMATION_SPEED = 20;
const SCROLL_THRESHOLD = 100;

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

function ChatMessage({ sender, message, shouldAnimate = false, onUpdate, userProfilePic, onAnimationComplete }: ChatMessageProps) {
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
          onUpdate?.();
        } else {
          setHasAnimated(true);
          clearInterval(interval);
          onAnimationComplete?.();
        }
      }, ANIMATION_SPEED); 
      
      return () => clearInterval(interval);
    } else if (sender === "bot" && !shouldAnimate) {
      setDisplayedMessage(message);
      setHasAnimated(true);
      onAnimationComplete?.();
    }
  }, []); 
  
  const avatarSrc = sender === "user" 
    ? (userProfilePic || "/dashboard/default-picture.png")
    : "/practice/chatbot-mascot.svg";
  
  const avatarFallback = sender === "user" ? "Y" : null;
  const displayName = sender === "user" ? "You" : "Chika - AI";
  
  return (
    <div className="flex gap-3 mb-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
        sender === "user" ? "bg-black" : "bg-blue"
      }`}>
        {sender === "user" && !userProfilePic ? (
          <span className="text-white font-body text-sm">{avatarFallback}</span>
        ) : (
          <Image 
            src={avatarSrc}
            alt={sender === "user" ? "User" : "Bot"}
            width={40} 
            height={40}
            className={sender === "user" ? "w-full h-full object-cover" : "w-[110%] h-[110%] object-contain object-top"}
          />
        )}
      </div>
      <div className="flex-1">
        <div className="font-body text-sm text-gray-300 mb-1">{displayName}</div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
          <p className="text-black font-body text-base whitespace-pre-wrap">
            {displayedMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotModal({ 
  showModal, 
  setShowModal,
  cardFront,
  cardBack,
  hasKeys = true,
  userProfilePic, 
}: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [noKeysLeft, setNoKeysLeft] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);
  const messageIdCounter = useRef(0);

  const [isAnimating, setIsAnimating] = useState(false);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const addMessage = (sender: "user" | "bot", message: string, shouldAnimate = false) => {
    const id = messageIdCounter.current;
    messageIdCounter.current += 1;
    
    setMessages(prev => [...prev, { 
      sender, 
      message, 
      id,
      shouldAnimate 
    }]);
  };

  const handleApiError = (error: any) => {
    if (error === "NO_KEYS_LEFT" || error === "INSUFFICIENT_KEYS") {
      setNoKeysLeft(true);
      return true;
    }
    return false;
  };

  const fetchChatResponse = async (userMessage: string, isInitial = false) => {
    const history = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.message
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: isInitial ? [] : history,
          ...(isInitial && { isInitialExplanation: true }),
          ...(!isInitial && { cardContext: { front: cardFront, back: cardBack } }),
        }),
      });

      const result = await res.json();
      
      if (handleApiError(result.error)) return null;
      
      if (result.success && result.response) {
        return result.response;
      }
      
      console.error("Chatbot error:", result.error);
      return "Sorry, I encountered an error. Please try again.";
    } catch (error) {
      console.error("Fetch error:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  // Initialize with card explanation
  useEffect(() => {
    if (showModal && !hasInitialized && cardFront && cardBack && !isInitializingRef.current) {
      isInitializingRef.current = true;
      setHasInitialized(true);
      
      if (!hasKeys) {
        setNoKeysLeft(true);
        isInitializingRef.current = false;
        return;
      }
      
      setIsLoading(true);
      setShouldAutoScroll(true);

      const initialRequest = `Please explain this flashcard:\n\nFront: ${cardFront}\nBack: ${cardBack}`;

      fetchChatResponse(initialRequest, true)
        .then(response => {
          setIsLoading(false);
          if (response) {
            setIsAnimating(true);
            addMessage("bot", response, true);
          }
          isInitializingRef.current = false;
        });
    }
  }, [showModal, hasInitialized, cardFront, cardBack, hasKeys]);

  // Reset state when modal closes
  useEffect(() => {
    if (!showModal) {
      setMessages([]);
      setFollowUpCount(0);
      setHasInitialized(false);
      setInputValue("");
      setNoKeysLeft(false);
      isInitializingRef.current = false;
      messageIdCounter.current = 0;
      setIsAnimating(false);
    }
  }, [showModal]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (followUpCount >= MAX_FOLLOWUP_QUESTIONS) {
      addMessage("bot", "You've already asked 2 follow-ups. Pause before asking more!", false);
      return;
    }

    const userMessage = inputValue;
    setInputValue("");
    setShouldAutoScroll(true);
    
    addMessage("user", userMessage, false);
    setIsLoading(true);
    
    const response = await fetchChatResponse(userMessage);
    setIsLoading(false);
    setIsAnimating(true);

    if (response) {
      addMessage("bot", response, true);
      setFollowUpCount(prev => prev + 1);
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

  const canSendMessage = !noKeysLeft && followUpCount < MAX_FOLLOWUP_QUESTIONS && !isAnimating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
        onClick={() => setShowModal(false)}
      />

      <div 
        className="relative bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl mx-4 z-10 flex flex-col h-[600px]"
        onKeyDown={(e) => e.stopPropagation()} 
      >
        {/* Header */}
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
          <h2 className="cursor-default text-xl sm:text-2xl font-main hover:text-lime transition-colors duration-300 ease-in-out">
            Kanang Kuan
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="cursor-pointer ml-auto w-10 h-10 flex items-center justify-center hover:text-black transition-colors duration-300 ease-in-out"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          {noKeysLeft ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-50 h-50 flex items-center justify-center">
                <Image 
                  src="/practice/chatbot-mascot.svg" 
                  alt="No Keys Left" 
                  width={128} 
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-gray-200 font-main text-center text-lg">
                You've used all your keys! Come back later!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  sender={msg.sender} 
                  message={msg.message}
                  shouldAnimate={msg.shouldAnimate}
                  onUpdate={scrollToBottom}
                  userProfilePic={userProfilePic} 
                  onAnimationComplete={() => setIsAnimating(false)}
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
                    <div className="font-body text-sm text-gray-300 mb-1">Chika</div>
                    <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                      <p className="text-gray-400 font-body text-base">
                        Thinking<LoadingDots />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
          {noKeysLeft ? (
            <div className="text-center py-3 text-gray-300 font-body">
              No keys remaining. You cannot send messages.
            </div>
          ) : followUpCount >= MAX_FOLLOWUP_QUESTIONS ? (
            <div className="text-center py-3 text-gray-300 font-body">
              You've asked 2 follow-ups already—let's pause for now!
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a follow-up question"
                disabled={isLoading || !canSendMessage}
                className="flex-1 px-4 py-3 text-gray-400 border-1 border-gray-300 rounded-full focus:outline-none focus:border-black transition-colors font-body disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim() || !canSendMessage}
                className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-full bg-lime flex items-center justify-center text-white hover:bg-pink transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowUp className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}