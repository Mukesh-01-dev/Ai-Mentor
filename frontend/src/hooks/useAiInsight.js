import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useAiInsight
 *
 * Manages the AI Insight panel state for the Discussions page.
 * - Fires an automatic intro message when the panel first opens.
 * - Sends user messages to POST /api/ai/discussion-insight with page context.
 * - The backend enforces a strict system prompt so the AI only answers
 *   questions about the Discussions page.
 */
const useAiInsight = ({ activeView, selectedCourse, postCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const introFiredRef = useRef(false);

  // Build the context object sent with every request so the AI knows
  // exactly what the user is currently looking at.
  const buildContext = useCallback(
    () => ({
      activeView,
      selectedCourse: selectedCourse
        ? { id: selectedCourse.courseId, name: selectedCourse.courseName }
        : null,
      postCount,
    }),
    [activeView, selectedCourse, postCount]
  );

  // Core function: send a message (or the auto-intro request) to the backend.
  const sendMessage = useCallback(
    async (text, { isIntro = false } = {}) => {
      const userMessage = isIntro ? null : { role: "user", content: text };

      if (!isIntro) {
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
      }

      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/ai/discussion-insight", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: isIntro ? "__INTRO__" : text,
            context: buildContext(),
          }),
        });

        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [buildContext]
  );

  // Fire intro automatically the first time the panel opens.
  useEffect(() => {
    if (isOpen && !introFiredRef.current) {
      introFiredRef.current = true;
      sendMessage("", { isIntro: true });
    }
  }, [isOpen, sendMessage]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || loading) return;
      sendMessage(trimmed);
    },
    [input, loading, sendMessage]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    messages,
    input,
    setInput,
    loading,
    handleSubmit,
  };
};

export default useAiInsight;