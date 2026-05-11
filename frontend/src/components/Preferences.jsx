import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

/* =========================
   STEPS DATA
========================= */
const WIZARD_STEPS = [
  {
    id: "learning_goal",
    question: "What is your learning goal?",
    multiSelect: false,
    options: [
      { value: "Switch Careers", icon: "🚀" },
      { value: "Upskill at Work", icon: "📈" },
      { value: "Personal Interest", icon: "🎯" },
      { value: "Get Certified", icon: "🏆" }
    ]
  },
  {
    id: "interested_topics",
    question: "Which topics interest you?",
    multiSelect: true,
    options: [
      { value: "Artificial Intelligence", icon: "🤖" },
      { value: "Web Development", icon: "💻" },
      { value: "Data Science", icon: "📊" },
      { value: "Cloud Computing", icon: "☁️" },
      { value: "Cybersecurity", icon: "🛡️" },
      { value: "Mobile Apps", icon: "📱" }
    ]
  },
  {
    id: "experience_level",
    question: "What is your experience level?",
    multiSelect: false,
    options: [
      { value: "Complete Beginner", icon: "🌱" },
      { value: "Some Basics", icon: "🌿" },
      { value: "Intermediate", icon: "🌳" },
      { value: "Advanced", icon: "🏔️" }
    ]
  },
  {
    id: "weekly_commitment",
    question: "How much time can you spend weekly?",
    multiSelect: false,
    options: [
      { value: "1–2 hours", icon: "⚡" },
      { value: "3–5 hours", icon: "🔥" },
      { value: "6–10 hours", icon: "🎖️" },
      { value: "10+ hours", icon: "👑" }
    ]
  },
  {
    id: "learning_style",
    question: "How do you prefer to learn?",
    multiSelect: false,
    options: [
      { value: "Video Lectures", icon: "🎥" },
      { value: "Hands-on Projects", icon: "🛠️" },
      { value: "Reading Articles", icon: "📖" },
      { value: "Live Classes", icon: "🏫" }
    ]
  }
];

/* =========================
   COMPONENT
========================= */
export default function Preferences() {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    learning_goal: "",
    interested_topics: [],
    experience_level: "",
    weekly_commitment: "",
    learning_style: ""
  });

  const currentStep = WIZARD_STEPS[stepIndex];
  const totalSteps = WIZARD_STEPS.length;

  /* =========================
     FETCH EXISTING DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const res = await axios.get("/api/preferences", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
          setPreferences({
            ...res.data,
            interested_topics: Array.isArray(res.data.interested_topics)
              ? res.data.interested_topics
              : []
          });
        }
      } catch (err) {
        console.log("No preferences yet");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     HANDLE SELECT
  ========================= */
  const handleSelect = (value) => {
    const field = currentStep.id;

    if (currentStep.multiSelect) {
      const current = preferences[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setPreferences({ ...preferences, [field]: updated });
    } else {
      setPreferences({ ...preferences, [field]: value });
    }
  };

  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post("/api/preferences", preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Preferences saved!");
    } catch (err) {
      alert("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     NAVIGATION
  ========================= */
  const handleNext = () => {
    if (stepIndex === totalSteps - 1) {
      handleSave();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  /* =========================
     UI
  ========================= */
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const currentValue = preferences[currentStep.id];
  const hasSelection = currentStep.multiSelect
    ? currentValue.length > 0
    : currentValue !== "";

  return (
    <div className="max-w-xl mx-auto p-6">

      {/* Progress */}
      <div className="mb-6 text-sm text-gray-500">
        Step {stepIndex + 1} / {totalSteps}
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-2">
        {currentStep.question}
      </h2>

      <p className="text-gray-400 mb-4">
        {currentStep.multiSelect
          ? "Select one or more options"
          : "Select one option"}
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {currentStep.options.map((opt) => {
          const selected = currentStep.multiSelect
            ? currentValue.includes(opt.value)
            : currentValue === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`p-4 rounded-lg border text-left transition
                ${selected
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
                }`}
            >
              <div className="text-xl">{opt.icon}</div>
              <div>{opt.value}</div>
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button onClick={handleBack} disabled={stepIndex === 0}>
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!hasSelection || saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving
            ? "Saving..."
            : stepIndex === totalSteps - 1
            ? "Finish"
            : "Next"}
        </button>
      </div>
    </div>
  );
}