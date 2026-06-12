export const detectIntent = (message) => {
  const text = message.toLowerCase();

  // =========================
  // INFORMATION INTENTS FIRST
  // =========================

  if (
    text.includes("enrolled course") ||
    text.includes("my courses") ||
    text.includes("courses enrolled") ||
    text.includes("what courses") ||
    text.includes("which courses")
  ) {
    return {
      type: "course_info",
    };
  }

  if (
    text.includes("my preferences") ||
    text.includes("what are my preferences") ||
    text.includes("show my preferences") ||
    text.includes("learning goal") ||
    text.includes("experience level") ||
    text.includes("learning style") ||
    text.includes("weekly commitment")
  ) {
    return {
      type: "preference_info",
    };
  }

  if (
    text.includes("theme") ||
    text.includes("language setting") ||
    text.includes("current language") ||
    text.includes("my settings")
  ) {
    return {
      type: "settings_info",
    };
  }

  if (
    text.includes("progress") ||
    text.includes("how am i doing") ||
    text.includes("completed lessons") ||
    text.includes("learning progress") ||
    text.includes("course progress")
  ) {
    return {
      type: "progress_info",
    };
  }

  if (
    text.includes("recommend") ||
    text.includes("what should i study") ||
    text.includes("next lesson") ||
    text.includes("what next") ||
    text.includes("suggest")
  ) {
    return {
      type: "recommendation",
    };
  }

  if (
    text.includes("current lesson") ||
    text.includes("where was i") ||
    text.includes("continue learning")
  ) {
    return {
      type: "current_lesson",
    };
  }

  // =========================
  // NAVIGATION INTENTS
  // =========================

  if (
    text.includes("go to settings") ||
    text.includes("open settings") ||
    text.includes("take me to settings")
  ) {
    return {
      type: "navigation",
      route: "/settings",
    };
  }

  if (
    text.includes("go to profile") ||
    text.includes("open profile") ||
    text.includes("take me to profile")
  ) {
    return {
      type: "navigation",
      route: "/settings",
    };
  }

  if (
    text.includes("go to preferences") ||
    text.includes("open preferences") ||
    text.includes("take me to preferences")
  ) {
    return {
      type: "navigation",
      route: "/settings",
    };
  }

  if (
    text.includes("go to community") ||
    text.includes("open community")
  ) {
    return {
      type: "navigation",
      route: "/discussions",
    };
  }

  if (
    text.includes("go to courses") ||
    text.includes("open courses") ||
    text.includes("browse courses")
  ) {
    return {
      type: "navigation",
      route: "/courses",
    };
  }

  if (
    text.includes("watch history") ||
    text.includes("open watch history")
  ) {
    return {
      type: "navigation",
      route: "/watchedvideos",
    };
  }

  if (
    text.includes("go to dashboard") ||
    text.includes("open dashboard")
  ) {
    return {
      type: "navigation",
      route: "/dashboard",
    };
  }

  if (
    text.includes("go to analytics") ||
    text.includes("open analytics")
  ) {
    return {
      type: "navigation",
      route: "/analytics",
    };
  }

  if (
    text.includes("go to certificates") ||
    text.includes("open certificates")
  ) {
    return {
      type: "navigation",
      route: "/certificates",
    };
  }

  if (
    text.includes("go to reports") ||
    text.includes("open reports")
  ) {
    return {
      type: "navigation",
      route: "/report",
    };
  }

  return {
    type: "ai",
  };
};