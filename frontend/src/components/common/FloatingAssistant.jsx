import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, MessageCircle} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white flex justify-between items-center shadow-md">
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
