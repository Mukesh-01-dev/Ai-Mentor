import { APP_ROUTES } from "./routeMap.js";

export const detectNavigation = (message) => {
  const text = message.toLowerCase();

  if (
    text.includes("preferences") ||
    text.includes("learning goal")
  ) {
    return APP_ROUTES.preferences;
  }

  if (
    text.includes("settings") ||
    text.includes("theme") ||
    text.includes("language")
  ) {
    return APP_ROUTES.settings;
  }

  if (
    text.includes("profile")
  ) {
    return APP_ROUTES.profile;
  }

  if (
    text.includes("course")
  ) {
    return APP_ROUTES.courses;
  }

  if (
    text.includes("community")
  ) {
    return APP_ROUTES.community;
  }

  return null;
};