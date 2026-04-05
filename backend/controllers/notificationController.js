import Notification from "../models/Notification.js";

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [["createdAt", "DESC"]],
            limit: 50,
        });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.unread = false;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { unread: false },
            { where: { userId: req.user.id, unread: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear
// @access  Private
export const clearAll = async (req, res) => {
    try {
        await Notification.destroy({
            where: { userId: req.user.id },
        });

        res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Utility function to create a notification
 * Can be used from other controllers
 */
export const createNotification = async (userId, { title, message, type, metadata = null }) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            metadata,
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error.message);
        return null;
    }
};
