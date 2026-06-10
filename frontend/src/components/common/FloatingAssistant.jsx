import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, MessageCircle, ChevronRight} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Resize boundaries and dimension states
  const [dimensions, setDimensions] = useState({ width: 320, height: 380 });
  const [isResizing, setIsResizing] = useState(false);
  
  const resizeData = useRef({ startWidth: 0, startHeight: 0, startX: 0, startY: 0 });

  const MIN_WIDTH = 300;
  const MAX_WIDTH = 500;
  const MIN_HEIGHT = 320;

  // Compute a tighter maximum height to completely avoid the dashboard top navbar
  const getMaxHeight = () => {
    const navbarHeight = 80; 
    const bottomPadding = 110; // Account for the floating action action items spacing
    const availableHeight = window.innerHeight - navbarHeight - bottomPadding;
    
    // Hard cap at 480px to keep it clean and localized inside the dashboard views
    return Math.max(MIN_HEIGHT, Math.min(480, availableHeight));
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

const [messages, setMessages] = useState([
  {
    sender: "assistant",
    text: "Hello! I'm your AI Mentor Assistant. How can I help you today?"
  }
]);

const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);

const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = input;

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: userMessage,
    },
  ]);

  setInput("");

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      "/api/assistant/chat",
      {
        message: userMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Assistant Response:", data);

    setMessages((prev) => [
      ...prev,
      {
        sender: "assistant",
        text: data.reply,
        route: data.route || null,
      },
    ]);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {
        sender: "assistant",
        text:
          error?.response?.data?.message ||
          "Sorry, something went wrong.",
      },
    ]);
  } finally {
    setLoading(false);
  }
};
  // Capture the starting dimensions when a user mouse-downs a resize handle
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeData.current = {
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  // Global mouse tracking computations
  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;

    // Fixed in bottom-right: dragging left (-delta) increases width, dragging up (-delta) increases height
    const deltaX = e.clientX - resizeData.current.startX;
    const deltaY = e.clientY - resizeData.current.startY;

    const newWidth = resizeData.current.startWidth - deltaX;
    const newHeight = resizeData.current.startHeight - deltaY;

    setDimensions({
      width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)),
      height: Math.max(MIN_HEIGHT, Math.min(getMaxHeight(), newHeight)),
    });
  }, [isResizing]);

  const handleResizeStop = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Clamps layout immediately if the active size configuration breaks threshold boundaries
  useEffect(() => {
    if (isOpen) {
      const maxH = getMaxHeight();
      if (dimensions.height > maxH) {
        setDimensions(prev => ({ ...prev, height: maxH }));
      }
    }
  }, [isOpen, window.innerHeight]);

  // Window listeners capture smooth dragging even if the cursor temporarily drifts out of the container
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeStop);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeStop);
    };
  }, [isResizing, handleResizeMove, handleResizeStop]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
          className="mb-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          {/* ================= RESIZE HANDLES ================= */}
          {/* Top-Left Corner Diagonal Handle */}
          <div 
            onMouseDown={handleResizeStart}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50"
            title="Resize window"
          />
          {/* Left Structural Side Handle */}
          <div 
            onMouseDown={handleResizeStart}
            className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize z-40"
          />
          {/* Top Structural Edge Handle */}
          <div 
            onMouseDown={handleResizeStart}
            className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize z-40"
          />
          {/* ================================================== */}

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white flex justify-between items-center shadow-md shrink-0 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Assistant</h3>
            </div>
            <button onClick={handleToggle} className="text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-canvas h-80 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-teal-500 text-white rounded-tr-none"
                      : "bg-canvas-alt border border-border rounded-tl-none"
                  }`}
                >
                  {msg.text}

                  {msg.route && (
                    <div className="mt-3">
                      <button
                        onClick={() => navigate(msg.route)}
                        className="bg-teal-500 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Go To Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-500">
                Assistant is typing...
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>
          <div className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute pointer-events-none' : 'rotate-0 scale-100 opacity-100 relative'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      {/* Close Button when open */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${!isOpen ? '-rotate-90 scale-0 opacity-0 absolute pointer-events-none' : 'rotate-0 scale-100 opacity-100 relative animate-in zoom-in-50 duration-200'}`}
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingAssistant;