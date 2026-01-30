import mongoose from "mongoose";

//Module Schema //
// const ModuleSchema = new mongoose.Schema({
//   id:{type:String},
//   title:{type:String},
//   lessons: [LessonSchema],
// })

//Lesson Schema//
// const LessonSchema = new mongoose.Schema({
//   id: String,
//   title: String,
//   duration: String,
//   youtubeUrl: String,
// });

//Course Schema //
const CourseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true},
  category: { type: String, required: true},
  level: { type: String, required: true},

  // REQUIRED BY FRONTEND (DO NOT REMOVE)
  lessons: { type: String,default:0, required: true},
  price: { type: Number, required: true},

  students: { type: String, required: true},
  rating: { type: Number, required: true},
  image: { type: String, required: true},
  categoryColor: String,
  // modules: [ModuleSchema],
  // totalLessons: { type: Number, default: 0 },
});

export default mongoose.model("Course", CourseSchema);
