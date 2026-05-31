import Preference from "../models/Preference.js";

// @desc Get user preferences
// @route GET /api/preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await Preference.findOne({ where: { user_id: userId } });

    if (!preferences) {
      return res.status(200).json(null);
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error("GET PREFERENCES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Create user preferences
// @route POST /api/preferences
export const createPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if preferences already exist for this user
    const existing = await Preference.findOne({ where: { user_id: userId } });
    if (existing) {
      return res.status(400).json({ message: "Preferences already exist" });
    }

    const {
      explanation_type,
      learning_style,
      teaching_pace,
      example_type,
      focus_area
    } = req.body;

    // Validate required fields
    if (!explanation_type || !learning_style || !teaching_pace || !example_type || !focus_area) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const preferences = await Preference.create({
      user_id: userId,
      explanation_type,
      learning_style,
      teaching_pace,
      example_type,
      focus_area
    });

    res.status(201).json(preferences);
  } catch (error) {
    console.error("CREATE PREFERENCES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update user preferences
// @route PUT /api/preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await Preference.findOne({ where: { user_id: userId } });

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    const {
      explanation_type,
      learning_style,
      teaching_pace,
      example_type,
      focus_area
    } = req.body;

    // Validate required fields
    if (!explanation_type || !learning_style || !teaching_pace || !example_type || !focus_area) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    preferences.explanation_type = explanation_type;
    preferences.learning_style = learning_style;
    preferences.teaching_pace = teaching_pace;
    preferences.example_type = example_type;
    preferences.focus_area = focus_area;

    await preferences.save();

    res.status(200).json(preferences);
  } catch (error) {
    console.error("UPDATE PREFERENCES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
