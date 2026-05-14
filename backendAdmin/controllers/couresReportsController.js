import { CourseReports } from "../models/CourseReports.js";
import User from "../models/User.js";

CourseReports.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export const getAllCouresReports = async (req, res) => {
  try {
    const reports = await CourseReports.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: reports,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
