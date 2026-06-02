import { CalendarTask } from "../models/modelAssociations.js";
// @desc Get all calendar tasks for user
// @route GET /api/calendar-tasks
// @access Private
export const getCalendarTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await CalendarTask.findAll({
            where: { userId },
            order: [["createdAt", "ASC"]],
        });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("GET CALENDAR TASKS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// @desc Create a calendar task
// @route POST /api/calendar-tasks
// @access Private
export const createCalendarTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, text, status } = req.body;
        const task = await CalendarTask.create({
            userId,
            date,
            text,
            status: status || "Upcoming",
        });
        res.status(201).json(task);
    } catch (error) {
        console.error("CREATE CALENDAR TASK ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// @desc Update a calendar task
// @route PUT /api/calendar-tasks/:id
// @access Private
export const updateCalendarTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { text, status } = req.body;
        const task = await CalendarTask.findOne({ where: { id, userId } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (text !== undefined) task.text = text;
        if (status !== undefined) task.status = status;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error("UPDATE CALENDAR TASK ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// @desc Delete a calendar task
// @route DELETE /api/calendar-tasks/:id
// @access Private
export const deleteCalendarTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const task = await CalendarTask.findOne({ where: { id, userId } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        await task.destroy();
        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        console.error("DELETE CALENDAR TASK ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
