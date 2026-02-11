import mongoose from "mongoose";
// ======================
// Key Concept Schema
// ======================
const keyConceptSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    borderColor: String,
    bgColor: String,
    textColor: String,
    descriptionColor: String,
  },
  { _id: false }
);
 
// ======================
// Lesson Schema
// ======================
const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // normalize to string
    title: String,
    duration: String,
    completed: { type: Boolean, default: false },
    playing: { type: Boolean, default: false },
    type: String,
    youtubeUrl: String,
    videoUrl: String,
    content: {
      introduction: String,
      keyConcepts: [keyConceptSchema],
    },
  },
  { _id: false }
);

// Module Schema
// ======================
const moduleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: String,
    lessons: [lessonSchema],
    tools: [String],
    activities: [String],
    assignment: String,
    activity: String,
  },
  { _id: false }
);


// ======================
// Course Schema
// ======================
const courseSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    rating: { type: Number, required: true },
    students: { type: String, required: true },
    lessons: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    categoryColor: { type: String, required: true },
    isBookmarked: { type: Boolean, default: false },

    // Course Preview
    tags: [String],
    subtitle: String,
    instructor: String,
    lastUpdated: String,
    language: String,
    subtitles: Boolean,
    duration: String,
    reviews: Number,
    thumbnail: String,
    whatYouLearn: [String],
    curriculum: [
      {
        title: String,
        goal: String,
        topics: [String],
        tools: [String],
        activities: [String],
        assignment: String,
        activity: String,
      },
    ],
    priceDetails: {
      current: Number,
      original: Number,
      discount: String,
    },
    countdown: {
      hours: Number,
      minutes: Number,
      seconds: Number,
    },
    features: [{ icon: String, text: String }],

    // Learning
    modules: [moduleSchema],
    course: {
      title: String,
      subtitle: String,
      logo: String,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("Course", courseSchema);
