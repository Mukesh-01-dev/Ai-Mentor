import React from "react";
import {
    Calendar,
    BookOpen,
    CheckCircle,
    Bell,
    MessageSquare,
    Award,
    Clock,
    User,
    Shield
} from "lucide-react";

const getIcon = (type) => {
    switch (type) {
        case "academic": return <Calendar className="w-4 h-4 text-blue-500" />;
        case "course": return <BookOpen className="w-4 h-4 text-emerald-500" />;
        case "achievement": return <Award className="w-4 h-4 text-orange-500" />;
        case "social": return <MessageSquare className="w-4 h-4 text-purple-500" />;
        case "account": return <User className="w-4 h-4 text-teal-500" />;
        case "security": return <Shield className="w-4 h-4 text-red-500" />;
        case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
        default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
};

const getBgColor = (type) => {
    switch (type) {
        case "academic": return "bg-blue-500/10";
        case "course": return "bg-emerald-500/10";
        case "achievement": return "bg-orange-500/10";
        case "social": return "bg-purple-500/10";
        case "account": return "bg-teal-500/10";
        case "security": return "bg-red-500/10";
        case "success": return "bg-green-500/10";
        default: return "bg-slate-500/10";
    }
};

const NotificationItem = ({ notification, onClick }) => {
    const { title, message, time, type, unread } = notification;

    return (
        <div
            onClick={() => {
                if (!unread) return;
                onClick(notification);
            }}

            className={`group relative flex items-start gap-4 p-4 hover:bg-canvas-alt transition-all cursor-pointer border-b border-border/50 last:border-0
${unread ? "bg-teal-500/5 border-l-4 border-teal-500" : ""}`}
        >
            {/* Unread Indicator */}
            {unread && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-full" />
            )}


            {/* Icon */}
            <div className="relative mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">

                {getIcon(type)}

                {unread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                )}

            </div>


            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h5 className={`text-sm truncate ${unread ? 'text-main font-extrabold' : 'text-muted font-medium'}`}>
                        {title}
                    </h5>
                    <div className="flex items-center text-[10px] text-muted font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        {time}
                    </div>
                </div>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default NotificationItem;