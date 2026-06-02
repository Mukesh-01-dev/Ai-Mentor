import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
    getCalendarTasks,
    createCalendarTask,
    updateCalendarTask,
    deleteCalendarTask,
} from "../controllers/calendarTaskController.js";
import {
    createCalendarTaskSchema,
    updateCalendarTaskSchema,
} from "../schemas/calendarTaskSchema.js";
const router = express.Router();
router.route("/")
    .get(protect, getCalendarTasks)
    .post(protect, validate(createCalendarTaskSchema), createCalendarTask);
router.route("/:id")
    .put(protect, validate(updateCalendarTaskSchema), updateCalendarTask)
    .delete(protect, deleteCalendarTask);
export default router;
