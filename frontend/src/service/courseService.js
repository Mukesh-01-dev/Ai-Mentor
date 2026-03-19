/**
 * Course API Service
 * Handles all course-related API calls with lazy loading optimization
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch all courses (lightweight - course listing)
 */
export const getAllCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

/**
 * Fetch course details with modules (but without lessons)
 * @param {number} courseId - Course ID
 */
export const getCourseDetails = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch course details");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Fetch modules for a specific course
 * @param {number} courseId - Course ID
 */
export const getCourseModules = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`);
    if (!response.ok) throw new Error("Failed to fetch modules");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching modules for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Fetch lessons for a specific module (LAZY LOAD)
 * Called only when user expands a module
 * @param {number} courseId - Course ID
 * @param {number} moduleId - Module ID
 */
export const getModuleLessons = async (courseId, moduleId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/modules/${moduleId}/lessons`
    );
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching lessons for module ${moduleId}:`,
      error
    );
    throw error;
  }
};

/**
 * Fetch full lesson details (LAZY LOAD)
 * Called only when user plays/opens a lesson
 * @param {number} courseId - Course ID
 * @param {number} moduleId - Module ID
 * @param {number} lessonId - Lesson ID
 */
export const getLessonDetails = async (courseId, moduleId, lessonId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
    );
    if (!response.ok) throw new Error("Failed to fetch lesson details");
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching lesson ${lessonId}:`,
      error
    );
    throw error;
  }
};

/**
 * LEGACY: Fetch full learning data (backward compatibility)
 * Fetches all modules and lessons for a course at once
 * @param {number} courseId - Course ID
 */
export const getCourseLearningData = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/learning`);
    if (!response.ok) throw new Error("Failed to fetch learning data");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching learning data for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Fetch user's courses
 */
export const getMyCourses = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch my courses");
    return await response.json();
  } catch (error) {
    console.error("Error fetching my courses:", error);
    throw error;
  }
};

/**
 * Fetch dashboard stats
 */
export const getStatsCards = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/stats/cards`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

/**
 * Admin: Create a new course
 */
export const createCourse = async (courseData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error("Failed to create course");
    return await response.json();
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

/**
 * Admin: Delete a course
 */
export const deleteCourse = async (courseId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete course");
    return await response.json();
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

/**
 * Admin: Add modules to a course
 */
export const addModules = async (courseId, modules, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ modules }),
    });
    if (!response.ok) throw new Error("Failed to add modules");
    return await response.json();
  } catch (error) {
    console.error("Error adding modules:", error);
    throw error;
  }
};

/**
 * Admin: Add lessons to a module
 */
export const addLessons = async (courseId, moduleId, lessons, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/modules/${moduleId}/lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessons }),
      }
    );
    if (!response.ok) throw new Error("Failed to add lessons");
    return await response.json();
  } catch (error) {
    console.error("Error adding lessons:", error);
    throw error;
  }
};

/**
 * Admin: Update lesson video
 */
export const updateLessonVideo = async (courseId, lessonId, videoData, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/video`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(videoData),
      }
    );
    if (!response.ok) throw new Error("Failed to update lesson video");
    return await response.json();
  } catch (error) {
    console.error("Error updating lesson video:", error);
    throw error;
  }
};

/**
 * Export all as default object for flexibility
 */
export default {
  getAllCourses,
  getCourseDetails,
  getCourseModules,
  getModuleLessons,
  getLessonDetails,
  getCourseLearningData,
  getMyCourses,
  getStatsCards,
  createCourse,
  deleteCourse,
  addModules,
  addLessons,
  updateLessonVideo,
};
