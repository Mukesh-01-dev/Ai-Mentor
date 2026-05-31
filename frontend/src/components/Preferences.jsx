import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const WIZARD_STEPS = [
  {
    id: "explanation_type",
    questionKey: "explanation_type",
    hintKey: "select_one",
    multiSelect: false,
    options: [
      { id: "simple", value: "simple", icon: "🌱" },
      { id: "balanced", value: "balanced", icon: "⚖️" },
      { id: "detailed", value: "detailed", icon: "🔍" },
      { id: "expert", value: "expert", icon: "🔬" }
    ]
  },
  {
    id: "learning_style",
    questionKey: "learning_style",
    hintKey: "select_one",
    multiSelect: false,
    options: [
      { id: "step_by_step", value: "step_by_step", icon: "🐾" },
      { id: "concept_first", value: "concept_first", icon: "💡" },
      { id: "real_world", value: "real_world", icon: "🌍" },
      { id: "problem_solving", value: "problem_solving", icon: "🧩" }
    ]
  },
  {
    id: "teaching_pace",
    questionKey: "teaching_pace",
    hintKey: "select_one",
    multiSelect: false,
    options: [
      { id: "slow", value: "slow", icon: "🐢" },
      { id: "moderate", value: "moderate", icon: "🚶" },
      { id: "fast", value: "fast", icon: "🚀" },
      { id: "adaptive", value: "adaptive", icon: "🤖" }
    ]
  },
  {
    id: "example_type",
    questionKey: "example_type",
    hintKey: "select_one",
    multiSelect: false,
    options: [
      { id: "real_life", value: "real_life", icon: "🏢" },
      { id: "technical", value: "technical", icon: "💻" },
      { id: "visual", value: "visual", icon: "📊" },
      { id: "minimal", value: "minimal", icon: "📝" }
    ]
  },
  {
    id: "focus_area",
    questionKey: "focus_area",
    hintKey: "select_one",
    multiSelect: false,
    options: [
      { id: "concepts", value: "concepts", icon: "🧠" },
      { id: "practical", value: "practical", icon: "🛠️" },
      { id: "coding", value: "coding", icon: "👨‍💻" },
      { id: "exams", value: "exams", icon: "📝" }
    ]
  }
];

export const buildAIPromptFromPreferences = (preferences) => {
  if (!preferences) return "";

  return `
    The user has specified the following learning preferences:
    - Explanation Type: ${preferences.explanation_type}
    - Learning Style: ${preferences.learning_style}
    - Teaching Pace: ${preferences.teaching_pace}
    - Example Type: ${preferences.example_type}
    - Focus Area: ${preferences.focus_area}
    
    Please ensure all your explanations and generated contents are aligned with these preferences.
  `.trim();
};

let moduleCache = { token: null, data: null, hasExisting: null, loaded: false };

const ProgressBar = ({ current, total }) => {
  const percentage = ((current + 1) / total) * 100;
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shrink border border-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 wizard-progress-bar rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[14px] font-medium text-gray-500 whitespace-nowrap">
        {current + 1} / {total}
      </span>
    </div>
  );
};

export default function Preferences({ mode = "modal", onSuccess }) {
  const { t } = useTranslation();
  const currentToken = localStorage.getItem("token");
  
  const isCached = moduleCache.token === currentToken && moduleCache.loaded;
  const [loading, setLoading] = useState(!isCached);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasExisting, setHasExisting] = useState(isCached ? moduleCache.hasExisting : false);
  const [isSkipped, setIsSkipped] = useState(() => localStorage.getItem("preferencesSkipped") === "true");

  useEffect(() => {
    if (mode === "modal") {
      console.log("Preferences Modal State:", {
        loading,
        hasExisting,
        isSkipped,
        isCached,
        currentToken: currentToken ? currentToken.substring(0, 10) + "..." : "null"
      });
    }
  }, [loading, hasExisting, isSkipped, isCached, currentToken, mode]);
  
  const [stepIndex, setStepIndex] = useState(0);
  const [preferences, setPreferences] = useState(isCached && moduleCache.data ? moduleCache.data : {
    explanation_type: "",
    learning_style: "",
    teaching_pace: "",
    example_type: "",
    focus_area: ""
  });

  const totalSteps = WIZARD_STEPS.length;
  const currentStep = WIZARD_STEPS[stepIndex];

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        if (moduleCache.token === token && moduleCache.loaded) {
          if (moduleCache.data) {
             setPreferences(moduleCache.data);
          }
          setHasExisting(moduleCache.hasExisting);
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/preferences", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const tokenForCache = localStorage.getItem("token") || token;

        if (res.data) {
          const freshData = {
            explanation_type: res.data.explanation_type || "",
            learning_style: res.data.learning_style || "",
            teaching_pace: res.data.teaching_pace || "",
            example_type: res.data.example_type || "",
            focus_area: res.data.focus_area || ""
          };
          setPreferences(freshData);
          setHasExisting(true);
          moduleCache = { token: tokenForCache, data: freshData, hasExisting: true, loaded: true };
        } else {
          setHasExisting(false);
          moduleCache = { token: tokenForCache, data: null, hasExisting: false, loaded: true };
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
        const tokenForCache = localStorage.getItem("token");
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setHasExisting(false);
          moduleCache = { token: tokenForCache, data: null, hasExisting: false, loaded: true };
        } else {
          moduleCache = { token: tokenForCache, data: null, hasExisting: false, loaded: false };
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentToken]);

  useEffect(() => {
    if (mode === "modal" && !loading && !hasExisting && !isSkipped) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [mode, loading, hasExisting, isSkipped]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      if (hasExisting) {
        await axios.put("/api/preferences", preferences, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("/api/preferences", preferences, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasExisting(true);
      }

      moduleCache = { token, data: preferences, hasExisting: true, loaded: true };

      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("preferencesSkipped", "true");
    setIsSkipped(true);
  };

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
        setStepIndex(prev => prev - 1);
    }
  };

  const handleOptionToggle = (optionValue) => {
    const isMulti = currentStep.multiSelect;
    const fieldId = currentStep.id;

    setPreferences(prev => {
        if (!isMulti) {
            return { ...prev, [fieldId]: optionValue };
        }
        const currentSelection = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
        if (currentSelection.includes(optionValue)) {
            return { ...prev, [fieldId]: currentSelection.filter(item => item !== optionValue) };
        } else {
            return { ...prev, [fieldId]: [...currentSelection, optionValue] };
        }
    });
  };

  if (loading) {
    if (mode === "modal") return null;
    return (
      <div className="bg-transparent text-slate-800 dark:text-slate-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500 dark:text-slate-400" />
        </div>
      </div>
    );
  }

  if (mode === "modal" && (hasExisting || isSkipped)) {
    return null;
  }

  const currentVal = preferences[currentStep.id];
  const hasSelection = currentStep.multiSelect 
    ? Array.isArray(currentVal) && currentVal.length > 0
    : Boolean(currentVal);

  const isModal = mode === "modal";

  const renderContent = () => (
    <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>
      <div className={`${isModal ? "p-8 flex flex-col h-full min-h-0" : "p-0"}`}>
        {isModal && (
          <div className="mb-6 shrink-0">
            <h4 className="text-[12px] font-bold text-blue-600 dark:text-blue-500 tracking-wider uppercase mb-2">QUICK SETUP</h4>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2 font-sans tracking-tight">{t("preferences.modal_title")}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-[15px]">{t("preferences.modal_subtitle")}</p>
          </div>
        )}

        <div className={`${isModal ? "overflow-y-auto flex-1 min-h-0 pl-1 -ml-1 pr-2 custom-scrollbar shrink" : ""}`}>
          <ProgressBar current={stepIndex} total={totalSteps} />
          <div className="mb-6 wizard-step-enter-active" key={stepIndex}>
            <h3 className="text-[18px] font-bold text-slate-800 dark:text-slate-100 mb-1">{t(`preferences.questions.${currentStep.questionKey}`)}</h3>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium mb-4">{t(`preferences.hints.${currentStep.hintKey}`)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.options.map((opt) => {
                  const label = t(`preferences.options.${opt.id}`);
                  const isSelected = currentStep.multiSelect 
                    ? (Array.isArray(currentVal) && currentVal.includes(opt.value))
                    : currentVal === opt.value;
                  return (
                    <button key={opt.id} onClick={() => handleOptionToggle(opt.value)}
                        className={`group relative flex items-center gap-3 px-4 py-[14px] rounded-[14px] text-left transition-all duration-200 border
                        ${isSelected ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30 dark:border-sky-500 shadow-sm wizard-option-selected" : "border-gray-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <span className={`text-[15px] font-medium transition-colors ${isSelected ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-50"}`}>{label}</span>
                    </button>
                  );
              })}
            </div>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-[14px]">{error}</div>}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button onClick={handleBack} className={`text-gray-400 dark:text-gray-500 font-medium hover:text-gray-600 dark:hover:text-gray-300 px-2 transition-colors ${stepIndex === 0 ? "invisible" : ""}`}>{t("preferences.back")}</button>
          <button onClick={handleNext} disabled={!hasSelection || isSaving} className={`flex items-center gap-2 h-12 px-6 rounded-xl text-white font-semibold transition-all ${!hasSelection || isSaving ? "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-teal-500 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"}`}>
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (stepIndex === totalSteps - 1 ? t("preferences.finish") : t("preferences.next"))}
          </button>
        </div>

        {isModal && (
            <div className="text-center mt-6 shrink-0">
                <button onClick={handleSkip} className="text-[13px] text-gray-400 hover:text-gray-600 underline underline-offset-4 decoration-gray-300 transition-colors">{t("preferences.skip_for_now")}</button>
            </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6" style={{ overscrollBehavior: 'contain' }}>
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">{renderContent()}</div>
      </div>
    );
  }

  return <div className="bg-transparent text-slate-800 dark:text-slate-200">{renderContent()}</div>;
}
