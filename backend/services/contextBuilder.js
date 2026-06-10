export const buildUserContext = (
  user,
  preferences
) => {
  const courses =
    user.purchasedCourses || [];

  const enrolledCourses =
    courses.map(c => c.courseTitle);

  let completedLessons = 0;

  courses.forEach(course => {
    completedLessons +=
      course.progress?.completedLessons
        ?.length || 0;
  });

  return `
User Information

Name:
${user.name}

Experience Level:
${preferences?.experience_level || "Unknown"}

Learning Goal:
${preferences?.learning_goal || "Unknown"}

Learning Style:
${preferences?.learning_style || "Unknown"}

Weekly Commitment:
${preferences?.weekly_commitment || "Unknown"}

Interested Topics:
${preferences?.interested_topics?.join(", ") || "None"}

Enrolled Courses:
${enrolledCourses.join(", ") || "None"}

Completed Lessons:
${completedLessons}

Language:
${user.settings?.appearance?.language || "en"}

Theme:
${user.settings?.appearance?.theme || "light"}
`;
};