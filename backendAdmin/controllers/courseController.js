import { Course } from "../models/index.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "category", "priceValue", "currency", "createdAt", "updatedAt"],
    });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, category, priceValue, currency } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const course = await Course.create({ title, category, priceValue: parseFloat(priceValue) || 0, currency: currency || "INR" });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
