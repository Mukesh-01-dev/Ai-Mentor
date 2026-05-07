import { useState } from "react";
import { useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import API_BASE_URL from "../lib/api";

/* ⭐ STAR RATING */
const StarRating = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hover || value);

                return (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className={`text-lg transition-all duration-150 transform ${active ? "text-yellow-400 scale-110" : "text-gray-500"
                            } hover:scale-125`}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
};

/* 📝 REVIEW MODAL */
const ReviewModal = ({ isOpen, onClose, review, setReview, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card p-5 rounded-2xl w-[400px] space-y-4">
                <h2 className="text-lg font-semibold">Write a Review</h2>

                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Optional..."
                    className="w-full p-3 rounded-lg border border-border bg-transparent focus:outline-none"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg hover:bg-white/10"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onSubmit}
                        className="bg-[#2DD4BF] px-4 py-2 rounded-lg text-white"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

/* 🎯 MAIN COMPONENT */
export const RatingSection = ({
    courseId,
    existingRating,
    existingFeedback,
    onUpdate
}) => {
    const [rating, setRating] = useState(existingRating || 0);
    const [review, setReview] = useState(existingFeedback || "");
    const [open, setOpen] = useState(false);

    const handleRatingChange = async (newRating) => {
        setRating(newRating); // instant UI

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/api/users/course-feedback`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    courseId,
                    rating: newRating,
                    feedback: review, // keep existing feedback
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update rating");
            }

            // 🔥 update global state instantly
            onUpdate(data.updatedCourse);

        } catch (err) {
            console.error(err);
            alert("Failed to update rating ❌");
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/api/users/course-feedback`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    courseId,
                    rating,
                    feedback: review,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // ✅ IMPORTANT: update parent/global state
            onUpdate(data.updatedCourse);

            setOpen(false);

        } catch (err) {
            console.error(err);
            alert("Failed to submit feedback ❌");
        }
    };

    return (
        <div className="flex items-center gap-5">
            {/* ⭐ Rating */}
            {/* <StarRating value={rating} onChange={setRating} /> */}
            <StarRating value={rating} onChange={handleRatingChange} />

            {/* 📝 Review Button */}
            <button
                onClick={() => {
                    if (!rating) return;
                    setOpen(true);
                }}
                disabled={!rating}
                className={`p-2 rounded-lg transition ${rating
                    ? "text-gray-200 hover:text-white hover:bg-white/10"
                    : "text-gray-500 cursor-not-allowed"
                    }`}
                title="Add review"
            >
                <MessageSquareText size={16} />
            </button>

            {/* 🪟 Modal */}
            <ReviewModal
                isOpen={open}
                onClose={() => setOpen(false)}
                review={review}
                setReview={setReview}
                onSubmit={handleSubmit}
            />
        </div>
    );
};