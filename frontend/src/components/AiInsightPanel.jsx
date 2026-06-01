import { useEffect, useRef } from "react";
import { X, Send, Sparkles, Loader2, Bot, User } from "lucide-react";

/**
 * AiInsightPanel
 *
 * A floating chat panel anchored to the bottom-right of the screen.
 * On open it automatically greets the user and explains the Discussions page.
 * It only answers questions about the Discussions page — off-topic questions
 * are politely refused by the backend system prompt.
 *
 * Props:
 *   isOpen      – boolean
 *   onClose     – () => void
 *   messages    – { role: "user"|"assistant", content: string }[]
 *   input       – string
 *   setInput    – (string) => void
 *   loading     – boolean
 *   handleSubmit– (e?) => void
 *   onToggle    – () => void  (for the FAB trigger button)
 */
const AiInsightPanel = ({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  loading,
  handleSubmit,
  onToggle,
}) => {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  return (
    <>
      {/* ── FAB trigger button ───────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        aria-label="Toggle AI Insight"
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg transition-all duration-300
          ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 rotate-90"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rotate-0"
          }
        `}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </button>

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-24 right-6 z-50
          w-[360px] max-w-[calc(100vw-3rem)]
          flex flex-col
          bg-card border border-border rounded-2xl shadow-2xl
          transition-all duration-300 ease-out
          ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }
        `}
        style={{ height: "480px" }}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-main leading-tight">
                AI Insight
              </p>
              <p className="text-[11px] text-muted leading-tight">
                Discussions assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-main transition-colors p-1 rounded-lg hover:bg-canvas-alt"
            aria-label="Close AI Insight panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
          {messages.length === 0 && loading && (
            <div className="flex items-start gap-2.5">
              <AssistantAvatar />
              <div className="bg-canvas-alt rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                <TypingDots />
              </div>
            </div>
          )}

          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i} className="flex items-start gap-2.5">
                <AssistantAvatar />
                <div className="bg-canvas-alt rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                  <p className="text-sm text-main leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2.5 justify-end">
                <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[80%]">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                </div>
              </div>
            )
          )}

          {/* Loading indicator after user message */}
          {loading && messages.length > 0 && (
            <div className="flex items-start gap-2.5">
              <AssistantAvatar />
              <div className="bg-canvas-alt rounded-2xl rounded-tl-sm px-3 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts — only shown before user has typed anything */}
        {messages.length <= 1 && !loading && (
          <div className="px-3 pb-2 flex gap-2 flex-wrap shrink-0">
            {[
              "How do I post here?",
              "What's the difference between tabs?",
              "How do I report a post?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  setTimeout(() => handleSubmit(), 0);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted hover:text-main hover:border-indigo-400 transition-colors bg-canvas-alt"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="px-3 pb-3 pt-1 flex gap-2 items-end shrink-0 border-t border-border"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask about the Discussions page…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-input border border-border rounded-xl px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 leading-relaxed"
            style={{ minHeight: "38px", maxHeight: "96px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </div>
    </>
  );
};

// ── Small helpers ────────────────────────────────────────────────────────────

const AssistantAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
    <Bot className="w-3.5 h-3.5 text-white" />
  </div>
);

const TypingDots = () => (
  <div className="flex gap-1 items-center h-4">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
      />
    ))}
  </div>
);

export default AiInsightPanel;