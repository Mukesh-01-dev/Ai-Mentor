import React from "react";
import { Bot, Sparkles } from "lucide-react";

const AIMentorCard = ({
  onAskMentor,
  onGenerateLesson,
}) => {
  return (
    <div
      className="
        relative
        overflow-hidden
        min-h-[220px]
        rounded-2xl
        border
        border-blue-100
        bg-gradient-to-br
        from-blue-50
        via-indigo-50
        to-purple-50
        p-5
      "
    >
      {/* Decorative sparkles */}
      <Sparkles
        className="absolute right-24 top-5 h-4 w-4 text-blue-300"
      />

      <Sparkles
        className="absolute right-10 top-12 h-3 w-3 text-purple-300"
      />

      <Sparkles
        className="absolute right-20 bottom-12 h-3 w-3 text-blue-200"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[65%]">
        {/* Title */}
        <div className="mb-3 flex items-center gap-2">
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-indigo-500
              text-white
            "
          >
            <Bot className="h-4 w-4" />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            Meet Your AI Mentor
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm leading-5 text-slate-600">
          Ask questions, generate lessons, get personalized guidance
          and learn smarter with AI.
        </p>

        {/* Buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAskMentor}
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-xs
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-blue-700
              hover:shadow-md
            "
          >
            Ask AI Mentor
          </button>

          <button
            type="button"
            onClick={onGenerateLesson}
            className="
              rounded-lg
              border
              border-blue-500
              bg-white/80
              px-4
              py-2
              text-xs
              font-semibold
              text-blue-600
              transition-all
              duration-200
              hover:bg-blue-50
              hover:shadow-md
            "
          >
            Generate AI Lesson
          </button>
        </div>
      </div>

      {/* Robot illustration */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-2
          w-[38%]
          max-w-[170px]
        "
      >
        <div className="flex h-32 items-end justify-center">
          <div className="relative">
            {/* Robot head */}
            <div className="relative h-20 w-24 rounded-[28px] border-4 border-slate-300 bg-white shadow-lg">
              {/* Antenna */}
              <div className="absolute left-1/2 -top-5 h-5 w-1 -translate-x-1/2 bg-slate-300" />
              <div className="absolute left-1/2 -top-7 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-400 shadow" />

              {/* Ear pieces */}
              <div className="absolute -left-5 top-7 h-7 w-5 rounded-l-xl bg-slate-300" />
              <div className="absolute -right-5 top-7 h-7 w-5 rounded-r-xl bg-slate-300" />

              {/* Face */}
              <div className="absolute inset-3 flex items-center justify-center rounded-2xl bg-slate-900">
                <div className="flex gap-3">
                  <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                  <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                </div>
              </div>
            </div>

            {/* Robot body */}
            <div className="mx-auto mt-1 h-12 w-16 rounded-t-2xl rounded-b-lg bg-slate-200">
              <div className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-500">
                AI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentorCard;