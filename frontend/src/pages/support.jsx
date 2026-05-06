import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is UptoSkills?",
    answer:
      "UptoSkills is an AI-powered Ed-Tech platform and talent employability ecosystem connecting students, colleges, and corporations to bridge the skill gap. Founded in 2016, it offers AI-driven assessments, gamified learning, hackathons, and direct internship/job placements, primarily focusing on making freshers industry-ready.",
  },
  {
    question: "What is AI-Mentor?",
    answer:
      "AI-Mentor is an AI-driven learning platform designed to help students develop technical skills through personalized and engaging mentorship experiences. The platform leverages advanced AI models to simulate diverse teaching styles inspired by well-known public figures, enabling users to learn in a more interactive and relatable way. It offers adaptive learning paths, dynamically generated practice questions, real-time feedback, and performance analytics to support continuous skill development across various technical domains.",
  },
  {
    question: "Can I track my performance?",
    answer:
      "Yes, your responses, scores, and feedback are stored so you can track progress over time.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, user data is securely stored and protected using authentication and backend security practices.",
  },
];

const Support = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas-alt text-main">
      
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-bold hover:text-teal-500"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back
        </button>
        <h1 className="mx-auto text-lg font-bold">Support</h1>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 space-y-6">

        {/* About Section */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-md font-bold mb-2">About UptoSkills</h2>
          <p className="text-sm text-muted">
            UptoSkills is designed to help students and professionals prepare for interviews using AI-driven analysis. 
            It evaluates responses, identifies weak areas, and provides actionable feedback to improve performance.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-md font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold hover:bg-canvas-alt"
                >
                  {faq.question}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-4 pb-3 text-sm text-muted">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;