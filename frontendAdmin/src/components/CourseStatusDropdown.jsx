import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const STATUS_CONFIG = {
  published: {
    label: "Published",
    dotColor: "bg-teal-500",
    textColor: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
  },
  disabled: {
    label: "Disabled",
    dotColor: "bg-amber-500",
    textColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  deleted: {
    label: "Deleted",
    dotColor: "bg-red-500",
    textColor: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

const MENU_OPTIONS = [
  { value: "published", label: "Published", description: "Visible to all users" },
  { value: "disabled", label: "Disabled", description: "Hidden from users" },
  { value: "delete", label: "Delete", description: "Permanently remove", isDanger: true },
];

export default function CourseStatusDropdown({
  courseId,
  currentStatus = "published",
  onStatusChange,
  onDeleteRequest,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.published;

  // Calculate portal position from button's bounding rect
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6, // 6px gap below button
      left: rect.right,     // right-aligned
    });
  }, []);

  // Recalculate position on open, scroll, resize
  useEffect(() => {
    if (!open) return;
    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click — checks both button and portal menu
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = async (option) => {
    setOpen(false);

    if (option.value === "delete") {
      onDeleteRequest?.(courseId);
      return;
    }

    if (option.value === currentStatus) return;

    setLoading(true);
    try {
      await onStatusChange(courseId, option.value);
    } finally {
      setLoading(false);
    }
  };

  // The floating menu rendered via portal
  const portalMenu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-52 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          style={{
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            transform: "translateX(-100%)", // right-align to button
          }}
        >
          {MENU_OPTIONS.map((option) => {
            const isActive = option.value === currentStatus;
            const optConfig = STATUS_CONFIG[option.value] || {};
            return (
              <div key={option.value}>
                {option.isDanger && <div className="border-t border-border" />}
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors cursor-pointer
                    ${isActive ? "bg-canvas-alt" : "hover:bg-canvas-alt"}
                    ${option.isDanger ? "hover:bg-red-500/10" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${optConfig.dotColor || "bg-red-500"}`} />
                    <span className={`text-xs font-bold ${option.isDanger ? "text-red-500" : "text-main"}`}>
                      {option.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[9px] font-bold text-muted uppercase tracking-widest">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted pl-3.5">{option.description}</span>
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && !loading && setOpen((prev) => !prev)}
        disabled={disabled || loading}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider
          transition-all duration-200 cursor-pointer select-none
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <span className="w-2 h-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
        )}
        <span>{config.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {portalMenu}
    </>
  );
}
