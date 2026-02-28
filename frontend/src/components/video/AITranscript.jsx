import React from "react";

/*
  AITranscript Component
*/
const AITranscript = ({ captions, currentTime, activeCaptionRef, containerRef, onTranscriptClick, formatTime }) => {
  return (
    <div
      ref={containerRef}
      className="lg:col-span-1 bg-card border-l border-border overflow-y-auto max-h-[calc(100vh-180px)]"
    >
      {/* Transcript Section - Takes 1 column */}
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
        <h2 className="text-lg font-semibold text-main">
          Transcript
        </h2>
      </div>
      <div
        className="px-6 py-4 space-y-4 scroll-smooth"
      >
        {captions.length > 0 ? (
          captions.map((caption, index) => {
            const isActive = currentTime >= caption.start && currentTime <= caption.end;
            return (
              <div
                key={index}
                ref={isActive ? activeCaptionRef : null}
                className={`py-3 border-l-4 pl-4 rounded-r cursor-pointer transition-all ${isActive
                    ? "border-blue-500 bg-transcript-bg border-border"
                    : "border-transparent bg-card hover:bg-color-transcript-bg hover:border-border"
                  }`}
                onClick={() => onTranscriptClick(caption.start)}
              >
                <div className="text-xs font-medium mb-1 text-muted">
                  {formatTime(caption.start)}
                </div>
                <div className="text-sm leading-relaxed text-muted">
                  {caption.text}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-muted text-center py-8">
            No transcript available for this lesson.
          </div>
        )}
      </div>
    </div>
  );
};

export default AITranscript;
