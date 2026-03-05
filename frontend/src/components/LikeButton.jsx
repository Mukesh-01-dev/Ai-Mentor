import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LikeButton = ({
    itemId,
    likes = [],
    endpoint,
    onUpdate,
    size = "w-4 h-4",
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const hasLiked = likes.some(
        (like) => like.userId === user?.id
    );

    const toggleLike = async () => {
        
    if (loading) return;

    setLoading(true);

    try {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);
        const response = await fetch(
            `${endpoint}/${itemId}/like`,
            {
                method: "POST",
                credentials: "include",  
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to toggle like");
        }

        const updatedItem = await response.json();

        // Let parent update state
        if (onUpdate) {
            onUpdate(updatedItem);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

return (
    <button
        onClick={toggleLike}
        disabled={loading}
        className={`flex items-center space-x-2 ${hasLiked
                ? "text-red-500"
                : "text-muted hover:text-red-500"
            }`}
    >
        <Heart
            className={`${size} ${hasLiked ? "fill-red-500" : ""
                }`}
        />
        <span className="text-sm">
            {likes.length}
        </span>
    </button>
);
};

export default LikeButton;