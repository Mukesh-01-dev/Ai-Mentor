import dotenv from "dotenv";

// Load environment variables — safe because npm run always sets CWD to backend/
dotenv.config();

// 3. Define the main logic in an async function using dynamic imports
async function clearPreferences() {
  try {
    console.log("Environment loaded.");

    // Use dynamic imports to ensure they happen AFTER dotenv.config()
    const { default: Preference } = await import("../models/Preference.js");
    const { sequelize } = await import("../config/db.js");

    console.log("Connecting to database...");
    await sequelize.authenticate();

    console.log("Clearing old preference data...");
    await Preference.destroy({
      where: {},
      truncate: true,
      cascade: false
    });

    console.log("SUCCESS: Preferences table cleared.");
    process.exit(0);
  } catch (error) {
    console.error("ERROR clearing preferences:", error);
    process.exit(1);
  }
}

clearPreferences();
