import React, { useState } from 'react';
import { Bot, X, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0); // 0: initial, 1: explore course response
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setChatStep(0); // Reset when opened
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
          <div className="p-4 bg-canvas h-64 overflow-y-auto flex flex-col gap-3">
            {/* Initial Greeting */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-teal-600" />
              </div>
              <div className="bg-canvas-alt border border-border p-3 rounded-2xl rounded-tl-none text-sm text-main shadow-sm">
                HELLO! I'm your learning assistant. How can I help you today?
              </div>
            </div>

            {/* Step 0: Suggestion to explore courses */}
            {chatStep === 0 && (
              <div className="flex flex-col gap-2 pl-10 mt-2 animate-in fade-in zoom-in-95 duration-300 delay-150 fill-mode-both">
                <button 
                  onClick={() => setChatStep(1)}
                  className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 border border-teal-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-left flex justify-between items-center"
                >
                  Explore Courses
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1: Response and navigation */}
            {chatStep === 1 && (
              <>
                <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-teal-500 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                    Explore Courses
                  </div>
                </div>
                <div className="flex gap-2 animate-in fade-in slide-in-from-left-4 duration-300 delay-150 fill-mode-both">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="bg-canvas-alt border border-border p-3 rounded-2xl rounded-tl-none text-sm text-main shadow-sm flex flex-col gap-3">
                    <p>Awesome! We have a wide variety of popular courses you can buy and enroll in today to upgrade your skills.</p>
                    <button 
                      onClick={() => {
                        handleToggle();
                        navigate('/courses', { state: { activeTab: 'explore' } });
                      }}
                      className="bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors self-start shadow-md shadow-teal-500/20"
                    >
                      Browse Courses Now
                    </button>
                  </div>
                </div>
              </>
            )}
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
