import CourseReport from "../models/CouresReport.js";

export const createReport = async (req, res) => {
  try {
    const { reportType, subType, description, courseName } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const report = await CourseReport.create({
      userId: req.user.id, 
      reportType,
      subType,
      description,
      courseName: courseName || null,
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};