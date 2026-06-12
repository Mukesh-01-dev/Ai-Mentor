import React, { useState, useEffect } from "react";
import { X, Sparkles, BookOpen, Clock, Loader2 } from "lucide-react";
import { callApi } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function CourseBuilderModal({ course, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchSyllabus();
  }, [course.id]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      // We use the learning endpoint which returns modules and lessons
      const response = await callApi(`/admin/courses/${course.id}/learning`);
      setModules(response.modules || []);
    } catch (err) {
      // If no modules exist yet, it might return 404 or empty, which is fine
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!window.confirm("This will use AI to generate a syllabus. It may take a minute. Continue?")) return;
    try {
      setGenerating(true);
      const res = await callApi(`/admin/courses/${course.id}/generate-syllabus`, {
        method: "POST"
      });
      showToast("Syllabus generated successfully!", "success");
      // refresh syllabus
      await fetchSyllabus();
    } catch (err) {
      showToast(err.message || "Failed to generate syllabus", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-canvas-alt">
          <div>
            <h3 className="text-xl font-bold text-main">Course Builder</h3>
            <p className="text-sm text-muted mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-canvas space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-main">Syllabus</h4>
            <button
              onClick={handleGenerateAI}
              disabled={generating || loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Magic AI Generate"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted">Loading syllabus...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-canvas-alt/50">
              <BookOpen className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
              <p className="text-main font-medium">No content added yet</p>
              <p className="text-sm text-muted mt-1">Use the Magic AI button to automatically generate a syllabus.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, idx) => (
                <div key={mod.id || idx} className="border border-border rounded-2xl bg-card overflow-hidden">
                  <div className="px-5 py-4 bg-canvas-alt/50 border-b border-border font-bold text-main">
                    {mod.title}
                  </div>
                  <div className="divide-y divide-border">
                    {mod.lessons?.map((les, lidx) => (
                      <div key={les.id || lidx} className="px-5 py-3 flex items-center justify-between hover:bg-canvas-alt/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-xs font-bold">
                            {lidx + 1}
                          </div>
                          <span className="text-sm font-medium text-main">{les.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {les.duration}</span>
                          <span className="uppercase px-2 py-0.5 rounded bg-border text-main">{les.type}</span>
                        </div>
                      </div>
                    ))}
                    {(!mod.lessons || mod.lessons.length === 0) && (
                      <div className="px-5 py-3 text-sm text-muted italic">No lessons in this module.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
