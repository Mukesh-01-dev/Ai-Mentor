/**
 * Centralized logic for profile completion checks and name formatting.
 */

/**
 * Ensures that a user's isProfileComplete flag is synchronized with their data.
 * Criteria: firstName, lastName, bio, avatar_url, and password (for Google-linked accounts)
 * @param {Object} user - The user model instance
 */
export const ensureProfileCompleteness = async (user) => {
  const isComplete = Boolean(
    user.firstName?.trim() &&
    user.lastName?.trim() &&
    user.bio?.trim() &&
    user.avatar_url?.trim() &&
    (user.googleId ? user.password?.trim() : true)
  );

  if (user.isProfileComplete !== isComplete) {
    user.isProfileComplete = isComplete;
    await user.save();
  }
  
  return isComplete;
};

/**
 * Standardizes user name generation from firstName and lastName.
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {string} - The trimmed full name
 */
export const formatFullName = (firstName, lastName) => {
  return `${firstName || ""} ${lastName || ""}`.trim();
};
