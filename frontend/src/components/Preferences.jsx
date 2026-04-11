import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, CheckCircle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const PREFERENCE_QUESTIONS = [
  {
    id: "explanation_type",
    title: "1. What type of explanations do you prefer?",
    options: [
      { id: "simple", label: "Simple & beginner-friendly" },
      { id: "balanced", label: "Balanced (easy + some depth)" },
      { id: "detailed", label: "Detailed & in-depth" },
      { id: "expert", label: "Expert-level (technical)" }
    ]
  },
  {
    id: "learning_style",
    title: "2. What learning style works best for you?",
    options: [
      { id: "step_by_step", label: "Step-by-step guidance" },
      { id: "concept_first", label: "Concept-first explanation" },
      { id: "real_world", label: "Real-world examples" },
      { id: "problem_solving", label: "Problem-solving focused" }
    ]
  },
  {
    id: "teaching_pace",
    title: "3. What teaching pace do you prefer?",
    options: [
      { id: "slow", label: "Slow & thorough" },
      { id: "moderate", label: "Moderate" },
      { id: "fast", label: "Fast-paced" },
      { id: "adaptive", label: "Adaptive (based on my progress)" }
    ]
  },
  {
    id: "example_type",
    title: "4. How do you prefer examples in explanations?",
    options: [
      { id: "real_life", label: "Real-life examples" },
      { id: "technical", label: "Technical examples" },
      { id: "visual", label: "Visual / diagram-based" },
      { id: "minimal", label: "Minimal examples" }
    ]
  },
  {
    id: "focus_area",
    title: "5. What should the AI focus more on in the videos?",
    options: [
      { id: "concepts", label: "Concepts & theory" },
      { id: "practical", label: "Practical applications" },
      { id: "coding", label: "Coding / problem-solving" },
      { id: "exams", label: "Exam preparation" }
    ]
  }
];

let moduleCache = { token: null, data: null, hasExisting: null };

export const buildAIPromptFromPreferences = (preferences) => {
  if (!preferences) return "";

  return `
    The user has specified the following learning preferences:
    - Explanation Type: ${preferences.explanation_type}
    - Learning Style: ${preferences.learning_style}
    - Teaching Pace: ${preferences.teaching_pace}
    - Example Type: ${preferences.example_type}
    - Focus Area: ${preferences.focus_area}
    ${preferences.extra_preferences ? `- Extra Preferences: ${preferences.extra_preferences}` : ""}
    
    Please ensure all your explanations and generated contents are aligned with these preferences.
  `.trim();
};

const QuestionBlock = ({ question, currentValue, onChange }) => {
  return (
    <div className="mb-8">
      <h3 className="text-[16px] font-semibold text-main mb-4">{question.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className={`
              relative flex items-center justify-between p-4 cursor-pointer rounded-xl border-2 transition-all
              ${currentValue === opt.label 
                  ? "border-[#00bea5] bg-teal-50/50 dark:bg-teal-900/10" 
                  : "border-border hover:border-[#00bea5]/50 bg-card"}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${currentValue === opt.label ? "border-[#00bea5]" : "border-muted"}
              `}>
                {currentValue === opt.label && <div className="w-2.5 h-2.5 rounded-full bg-[#00bea5]" />}
              </div>
              <span className={`text-[15px] font-medium ${currentValue === opt.label ? "text-[#00bea5]" : "text-main"}`}>
                {opt.label}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const PreferencesContent = ({ 
  state, 
  setState, 
  onSave, 
  isSaving, 
  error,
  isModal = false 
}) => {
  const isComplete = 
    state.explanation_type &&
    state.learning_style &&
    state.teaching_pace &&
    state.example_type &&
    state.focus_area;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className={`${isModal ? "p-6 sm:p-8" : "p-0"}`}>
        {isModal && (
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#00bea5]" />
            </div>
            <h2 className="text-2xl font-bold text-main mb-2">Personalize Your AI Tutor</h2>
            <p className="text-muted text-[15px]">Help us tailor explanations to match your learning style.</p>
          </div>
        )}

        <div className="space-y-2">
          {PREFERENCE_QUESTIONS.map((q) => (
            <QuestionBlock
              key={q.id}
              question={q}
              currentValue={state[q.id]}
              onChange={(val) => setState(prev => ({ ...prev, [q.id]: val }))}
            />
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-[16px] font-semibold text-main mb-4">6. Extra Preferences (Optional)</h3>
          <textarea
            value={state.extra_preferences}
            onChange={(e) => setState(prev => ({ ...prev, extra_preferences: e.target.value }))}
            placeholder="e.g., Prefer animations, keep videos short, focus on coding examples"
            className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-input text-main text-[15px] focus:ring-2 focus:ring-[#00bea5] focus:border-[#00bea5] resize-none"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px]">
            {error}
          </div>
        )}

        <div className={`flex items-center pt-6 border-t border-border mt-8 ${isModal ? "justify-center" : "justify-end"}`}>
          <button
            onClick={onSave}
            disabled={!isComplete || isSaving}
            className={`
              flex items-center gap-2 h-[50px] px-8 rounded-xl text-white font-medium text-[16px] transition-all
              ${!isComplete || isSaving 
                ? "bg-muted cursor-not-allowed opacity-70" 
                : "bg-gradient-to-r from-[#00bea5] to-[#00b09b] hover:shadow-lg hover:shadow-[#00bea5]/20 hover:-translate-y-0.5"
              }
            `}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isModal ? "Save & Continue" : "Save Changes"}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Override QuestionBlock to attach onChange to the labels
const QuestionBlockWithActions = ({ question, currentValue, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-5">
      <h3 className="text-[15px] font-semibold text-main mb-3">{t(`preferences.questions.${question.id}`)}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            onClick={() => onChange(opt.label)}
            className={`
              relative flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl border-2 transition-all
              ${currentValue === opt.label 
                  ? "border-[#00bea5] bg-teal-50/50 dark:bg-teal-900/10" 
                  : "border-border hover:border-[#00bea5]/50 bg-card"}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                ${currentValue === opt.label ? "border-[#00bea5]" : "border-muted"}
              `}>
                {currentValue === opt.label && <div className="w-2 h-2 rounded-full bg-[#00bea5]" />}
              </div>
              <span className={`text-[14px] leading-tight font-medium ${currentValue === opt.label ? "text-[#00bea5]" : "text-main"}`}>
                {t(`preferences.options.${opt.id}`)}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};


const PreferencesModal = ({ state, setState, onSave, isSaving, error }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card rounded-2xl sm:rounded-[24px] shadow-2xl my-8">
        <PreferencesContent 
          state={state}
          setState={setState}
          onSave={onSave}
          isSaving={isSaving}
          error={error}
          isModal={true}
        />
      </div>
    </div>
  );
};

export default function Preferences({ mode = "modal", onSuccess }) {
  const { t } = useTranslation();
  const currentToken = localStorage.getItem("token");
  
  // Conditionally bypass initial loading if valid cache exists
  const isCached = moduleCache.token === currentToken && moduleCache.data !== null;
  const [loading, setLoading] = useState(!isCached);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasExisting, setHasExisting] = useState(isCached ? moduleCache.hasExisting : false);
  
  const [state, setState] = useState(isCached ? moduleCache.data : {
    explanation_type: "",
    learning_style: "",
    teaching_pace: "",
    example_type: "",
    focus_area: "",
    extra_preferences: ""
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (moduleCache.token === token && moduleCache.data) {
          setState(moduleCache.data);
          setHasExisting(moduleCache.hasExisting);
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/preferences", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
          const freshData = {
            explanation_type: res.data.explanation_type || "",
            learning_style: res.data.learning_style || "",
            teaching_pace: res.data.teaching_pace || "",
            example_type: res.data.example_type || "",
            focus_area: res.data.focus_area || "",
            extra_preferences: res.data.extra_preferences || ""
          };
          setState(freshData);
          setHasExisting(true);
          moduleCache = { token, data: freshData, hasExisting: true };
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      if (hasExisting) {
        await axios.put("/api/preferences", state, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("/api/preferences", state, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasExisting(true);
      }

      moduleCache = { token, data: state, hasExisting: true };

      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // We add useEffect to lock body scroll when modal is open to ensure dashboard doesn't scroll behind it
  // Placed at the top level to respect Rules of Hooks
  useEffect(() => {
    if (mode === "modal" && !loading && !hasExisting) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [mode, loading, hasExisting]);

  if (loading) {
    if (mode === "settings") {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#00bea5]" />
        </div>
      );
    }
    return null;
  }

  // If in modal mode and user already has preferences, do not show modal
  if (mode === "modal" && hasExisting) {
    return null;
  }

  // Swap out the earlier QuestionBlock reference to use QuestionBlockWithActions
  const renderContent = () => (
    <div className={`flex flex-col h-full bg-card ${mode === "modal" ? "overflow-hidden" : ""}`} onClick={e => e.stopPropagation()}>
      <div className={`${mode === "modal" ? "p-6 sm:p-8 flex flex-col h-full min-h-0" : "p-0"}`}>
        {mode === "modal" && (
          <div className="mb-5 text-center shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-main mb-2">{t("preferences.modal_title")}</h2>
            <p className="text-muted text-[14px]">{t("preferences.modal_subtitle")}</p>
          </div>
        )}

        <div className={`${mode === "modal" ? "overflow-y-auto flex-1 min-h-0 pl-1 -ml-1 pr-2 custom-scrollbar shrink" : ""}`}>
          <div className="space-y-1">
            {PREFERENCE_QUESTIONS.map((q) => (
              <QuestionBlockWithActions
                key={q.id}
                question={q}
                currentValue={state[q.id]}
                onChange={(val) => setState(prev => ({ ...prev, [q.id]: val }))}
              />
            ))}
          </div>

          <div className="mb-4 mt-2">
            <h3 className="text-[15px] font-semibold text-main mb-3">{t("preferences.extra_title")}</h3>
            <textarea
              value={state.extra_preferences}
              onChange={(e) => setState(prev => ({ ...prev, extra_preferences: e.target.value }))}
              placeholder={t("preferences.extra_placeholder")}
              className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-border bg-input text-main text-[14px] focus:ring-2 focus:ring-[#00bea5] focus:border-[#00bea5] resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px]">
            {error}
          </div>
        )}

        <div className={`flex items-center pt-5 border-t border-border mt-4 shrink-0 ${mode === "modal" ? "justify-center" : "justify-end"}`}>
          <button
            onClick={handleSave}
            disabled={
              !(state.explanation_type && state.learning_style && state.teaching_pace && state.example_type && state.focus_area) || isSaving
            }
            className={`
              flex items-center gap-2 h-[50px] px-8 rounded-xl text-white font-medium text-[16px] transition-all
              ${(!(state.explanation_type && state.learning_style && state.teaching_pace && state.example_type && state.focus_area) || isSaving)
                ? "bg-muted cursor-not-allowed opacity-70" 
                : "bg-gradient-to-r from-[#00bea5] to-[#00b09b] hover:shadow-lg hover:shadow-[#00bea5]/20 hover:-translate-y-0.5"
              }
            `}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "modal" ? t("preferences.save_continue") : t("preferences.save_changes")}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" style={{ overscrollBehavior: 'contain' }}>
        <div className="relative w-full max-w-2xl bg-card rounded-2xl sm:rounded-[24px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_6px_0_rgba(0,0,0,0.10),0_10px_15px_0_rgba(0,0,0,0.10)] p-4 sm:p-6 md:p-8">
      {renderContent()}
    </div>
  );
}
