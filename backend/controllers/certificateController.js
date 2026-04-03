import Course from "../models/Course.js";
import { generateCertificatePDF } from "../templates/certificateTemplate.js";

export const getCertificates = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const purchasedCourses = user.purchasedCourses || [];
    let stats = {
      totalEnrolled: purchasedCourses.length,
      completed: 0,
      certificatesEarned: 0,
      inProgress: 0,
    };

    let coursesData = [];
    
    for (const pCourse of purchasedCourses) {
       const dbCourse = await Course.findByPk(pCourse.courseId);
       
       let totalLessons = 0;
       if (dbCourse) {
          const lessonsText = typeof dbCourse.lessons === "string" ? dbCourse.lessons : null;

          if (typeof dbCourse.lessonsCount === "number" && !Number.isNaN(dbCourse.lessonsCount)) {
            totalLessons = dbCourse.lessonsCount;
          } else if (lessonsText) {

          const parsedFromOf = lessonsText.includes(" of ") ? parseInt(lessonsText.split(" of ")[1]) : NaN;

          const parsedFromFirst = Number.isNaN(parsedFromOf) ? parseInt(lessonsText.split(" ")[0]) : parsedFromOf;

          totalLessons = Number.isNaN(parsedFromFirst) ? 0 : parsedFromFirst;

          } else {
            totalLessons = 0;
          }
        } else {
            totalLessons = 10; // default fallback
          }
       
       const completedLessonsList = pCourse.progress?.completedLessons || [];
       let completedLessons = completedLessonsList.length;
       
       // Fallback checking lessonData as users might have watchHistory.progressPercent = 100
       const lessonData = pCourse.progress?.lessonData || {};
       let actualCompleted = Object.values(lessonData).filter(l => l.watchHistory?.progressPercent >= 95).length;
       if (actualCompleted > completedLessons) {
          completedLessons = actualCompleted;
       }
       
       if (completedLessons > totalLessons && totalLessons > 0) completedLessons = totalLessons;
       
       // Mark as completed
       const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;
       
       if (isCompleted) {
         stats.completed++;
         stats.certificatesEarned++;
       } else {
         stats.inProgress++;
       }
       
       coursesData.push({
         courseId: pCourse.courseId,
         courseTitle: pCourse.courseTitle || dbCourse?.title || "Unknown Course",
         courseImage: dbCourse?.image || null,
         category: dbCourse?.category || "General",
         isCompleted,
         completedLessons,
         totalLessons
       });
    }

    res.json({ stats, courses: coursesData });
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: "courseId is required" });

    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const purchasedCourses = user.purchasedCourses || [];
    const pCourse = purchasedCourses.find(c => Number(c.courseId) === Number(courseId));
    
    if (!pCourse) return res.status(404).json({ message: "Course not found for this user" });
    
    const dbCourse = await Course.findByPk(courseId);
    const courseTitle = pCourse.courseTitle || dbCourse?.title || "Unknown Course";
    
    // Format date text
    const dateText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const studentName = user.name || "Student Name";

    // Call function to generate PDF
    const pdfBytes = await generateCertificatePDF(studentName, courseTitle, dateText);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate_${courseId}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("Error generating certificate pdf:", err);
    res.status(500).json({ message: "Server error" });
  }
};
