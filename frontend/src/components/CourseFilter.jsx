// frontend/src/components/CourseFilter.jsx
import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

const FILTERS = {
    level: {
        label: "Level",
        options: ["Beginner", "Intermediate", "Advanced"],
    },
    category: {
        label: "Category",
        options: [
            "Web Development",
            "Data Science",
            "AI & Machine Learning",
            "Mobile Development",
            "DevOps",
            "Cybersecurity",
            "Design",
            "Business",
        ],
    },
    price: {
        label: "Price",
        options: ["Free", "Paid"],
    },
    rating: {
        label: "Rating",
        options: ["4.5 & above", "4.0 & above", "3.5 & above"],
    },
    duration: {
        label: "Duration",
        options: ["< 2 hours", "2–5 hours", "5–10 hours", "> 10 hours"],
    },
};

export default function CourseFilter({ filters, onChange, onClear }) {
    const [open, setOpen] = useState(false);
    const [openSub, setOpenSub] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    const activeCount = Object.values(filters).filter(Boolean).length;

    // Calculate position of dropdown based on trigger button
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
            });
        }
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
                setOpenSub(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Reposition on scroll/resize
    useEffect(() => {
        if (open) {
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
            return () => {
                window.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }
    }, [open]);

    const handleToggle = () => {
        if (!open) updatePosition();
        setOpen((p) => !p);
        setOpenSub(null);
    };

    const handleSelect = (key, value) => {
        onChange({ ...filters, [key]: filters[key] === value ? "" : value });
        setOpenSub(null);
    };

    const handleClear = () => {
        onClear();
        setOpenSub(null);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all border ${open || activeCount > 0
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30"
                    : "bg-black/30 text-white border-white/20 hover:bg-black/40"
                    }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeCount > 0 && (
                    <span className="bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {activeCount}
                    </span>
                )}
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Portal-style fixed dropdown — renders OUTSIDE hero overflow-hidden */}
            {open && (
                <div
                    ref={panelRef}
                    style={{
                        position: "fixed",
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 9999,
                    }}
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                            Filter Courses
                        </span>
                        {activeCount > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <X className="w-3 h-3" /> Clear all
                            </button>
                        )}
                    </div>

                    {/* Filter sections */}
                    <div className="p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
                        {Object.entries(FILTERS).map(([key, { label, options }]) => (
                            <div key={key}>
                                {/* Filter row button */}
                                <button
                                    onClick={() =>
                                        setOpenSub((p) => (p === key ? null : key))
                                    }
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${filters[key]
                                        ? "bg-indigo-50 border border-indigo-300 text-indigo-700 font-semibold"
                                        : "border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 w-16 text-left">
                                            {label}
                                        </span>
                                        <span
                                            className={`${filters[key] ? "text-indigo-700" : "text-gray-400"
                                                }`}
                                        >
                                            {filters[key] ? filters[key] : "Any"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {filters[key] && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onChange({ ...filters, [key]: "" });
                                                }}
                                                className="text-indigo-300 hover:text-indigo-600 cursor-pointer p-0.5 rounded-full hover:bg-indigo-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </span>
                                        )}
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSub === key ? "rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                </button>

                                {/* Sub-options */}
                                {openSub === key && (
                                    <div className="mt-1 ml-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                                        {options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSelect(key, opt)}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${filters[key] === opt
                                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                                    : "text-gray-700 hover:bg-white"
                                                    }`}
                                            >
                                                {opt}
                                                {filters[key] === opt && (
                                                    <Check className="w-3.5 h-3.5 text-indigo-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Active filter chips at bottom */}
                    {activeCount > 0 && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                            {Object.entries(filters).map(([key, val]) =>
                                val ? (
                                    <span
                                        key={key}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
                                    >
                                        {val}
                                        <button
                                            onClick={() => onChange({ ...filters, [key]: "" })}
                                            className="hover:text-indigo-900 ml-0.5"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ) : null
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}