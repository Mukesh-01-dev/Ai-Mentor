import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";

const COUNTDOWN_SECONDS = 3;

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  courseTitle = "Untitled Course",
  enrolledCount = 0,
  isDeleting = false,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  // Both conditions must be met: typed DELETE + countdown finished
  const canDelete = confirmText === "DELETE" && countdown <= 0 && !isDeleting;

  const handleConfirm = useCallback(() => {
    if (canDelete) {
      onConfirm();
    }
  }, [canDelete, onConfirm]);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && canDelete) {
        handleConfirm();
      }
      if (e.key === "Escape") {
        onClose();
      }
    },
    [canDelete, handleConfirm, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border bg-red-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-main tracking-tight">Permanently Delete Course</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Course info */}
          <div className="p-4 rounded-2xl bg-canvas-alt border border-border">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Course to Delete</div>
            <div className="text-main font-bold text-base line-clamp-2">{courseTitle}</div>
          </div>

          {/* Warnings */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-500 font-medium leading-relaxed">
                This action <strong>cannot be undone</strong>. All modules, lessons, and course content will be{" "}
                <strong>permanently removed</strong> from the database.
              </p>
            </div>

            {enrolledCount > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 font-medium leading-relaxed">
                  <strong>{enrolledCount} student{enrolledCount > 1 ? "s" : ""}</strong>{" "}
                  {enrolledCount > 1 ? "are" : "is"} enrolled in this course. Their enrollment records will also be removed.
                </p>
              </div>
            )}
          </div>

          {/* Type DELETE input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
              Type <span className="text-red-500 font-black">DELETE</span> to confirm
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Type DELETE here"
              value={confirmText}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow uppercase A-Z — reject everything else silently
                if (/^[A-Z]*$/.test(val)) {
                  setConfirmText(val);
                }
              }}
              disabled={isDeleting}
              className={`
                w-full h-12 px-5 rounded-2xl bg-canvas border text-center font-mono font-bold text-base tracking-[0.3em] uppercase
                outline-hidden transition-all
                ${
                  confirmText === "DELETE"
                    ? "border-red-500 ring-4 ring-red-500/10 text-red-500"
                    : "border-border focus:border-red-400 focus:ring-4 focus:ring-red-500/10 text-main"
                }
                disabled:opacity-50
              `}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 h-14 rounded-2xl border border-border font-bold uppercase tracking-widest text-[11px] hover:bg-canvas-alt transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canDelete}
              className={`
                flex-[2] h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all
                flex items-center justify-center gap-2
                ${
                  canDelete
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20 cursor-pointer"
                    : "bg-red-500/20 text-red-500/40 cursor-not-allowed"
                }
              `}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : countdown > 0 ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  Wait {countdown}s...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete Permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
