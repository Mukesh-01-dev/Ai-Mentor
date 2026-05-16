import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import toast from "react-hot-toast";
import Header from "../components/Header";

const API_BASE = "http://localhost:5000";

const AdminPage = () => {
const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();

const [courses, setCourses] = useState([]);
const [selectedCourse, setSelectedCourse] = useState(null);
const [activeTab, setActiveTab] = useState('courses');

const [newCourse, setNewCourse] = useState({
id: '',
title: '',
category: '',
level: '',
rating: 4.5,
students: '0 students',
lessons: '0 lessons',
price: '₹0',
image: '',
categoryColor: 'bg-blue-100 text-blue-600',
});

const [videoUrl, setVideoUrl] = useState('');
const [selectedLesson, setSelectedLesson] = useState('');
const [selectedModule, setSelectedModule] = useState('');

const [subtopics, setSubtopics] = useState([
{ title: '', goal: '', topics: [''], tools: [''], activities: [''], assignment: '', activity: '' }
]);

const [newLessons, setNewLessons] = useState([
{ id: '', title: '', duration: '', completed: false, playing: false, type: 'video' }
]);

const [newModules, setNewModules] = useState([{ id: '', title: '' }]);

// ✅ FETCH COURSES
const fetchCourses = async () => {
try {
const response = await fetch(`${API_BASE}/api/courses`, {
credentials: "include"
});
const data = await response.json();
setCourses(data);
} catch (error) {
console.error(error);
}
};

useEffect(() => {
fetchCourses();
}, []);

const handleInputChange = (e) => {
const { name, value } = e.target;
setNewCourse((prev) => ({ ...prev, [name]: value }));
};

// ✅ ADD COURSE
const handleAddCourse = async (e) => {
e.preventDefault();
try {
const response = await fetch(`${API_BASE}/api/courses`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: "include",
body: JSON.stringify({
...newCourse,
id: newCourse.id ? parseInt(newCourse.id) : undefined,
rating: parseFloat(newCourse.rating)
}),
});


  if (!response.ok) throw new Error('Failed to add course');

  await fetchCourses();
  toast.success('Course added successfully!');
} catch (error) {
  toast.error(error.message);
}


};

// ✅ DELETE COURSE
const handleDeleteCourse = async (courseId) => {
if (!window.confirm('Delete this course?')) return;

try {
  const response = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    method: 'DELETE',
    credentials: "include",
  });

  if (!response.ok) throw new Error('Failed to delete');

  await fetchCourses();
  toast.success('Deleted successfully!');
} catch (error) {
  toast.error(error.message);
}


};

// ✅ UPDATE VIDEO
const handleUpdateVideo = async () => {
try {
const response = await fetch(
`${API_BASE}/api/courses/${selectedCourse.id}/lessons/${selectedLesson}/video`,
{
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
credentials: "include",
body: JSON.stringify({ youtubeUrl: videoUrl }),
}
);


  if (!response.ok) throw new Error('Failed');

  toast.success('Updated!');
} catch (error) {
  toast.error(error.message);
}


};

// ✅ ADD SUBTOPICS
const handleAddSubtopics = async () => {
try {
const response = await fetch(`${API_BASE}/api/courses/${selectedCourse.id}/subtopics`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: "include",
body: JSON.stringify({ subtopics }),
});

  if (!response.ok) throw new Error('Failed');

  toast.success('Subtopics added!');
} catch (error) {
  toast.error(error.message);
}

};

// ✅ ADD LESSONS
const handleAddLessons = async () => {
try {
const response = await fetch(
`${API_BASE}/api/courses/${selectedCourse.id}/modules/${selectedModule}/lessons`,
{
method: 'POST',
headers: { 'Content-Type': 'application/json' },
credentials: "include",
body: JSON.stringify({ lessons: newLessons }),
}
);


  if (!response.ok) throw new Error('Failed');

  toast.success('Lessons added!');
} catch (error) {
  toast.error(error.message);
}


};

return ( <div className="min-h-screen flex"> <Sidebar activePage="admin" />


  <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-6`}>
    <Header />

    <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

    {/* ADD COURSE */}
    <form onSubmit={handleAddCourse} className="grid gap-3 mb-6">
      <input name="id" placeholder="ID" value={newCourse.id} onChange={handleInputChange} className="border p-2" />
      <input name="title" placeholder="Title" value={newCourse.title} onChange={handleInputChange} className="border p-2" />
      <input name="category" placeholder="Category" value={newCourse.category} onChange={handleInputChange} className="border p-2" />
      <input name="level" placeholder="Level" value={newCourse.level} onChange={handleInputChange} className="border p-2" />

      <button className="bg-blue-600 text-white p-2 rounded">
        Add Course
      </button>
    </form>

    {/* COURSES */}
    {courses.map((course) => (
      <div key={course.id} className="flex justify-between border p-3 mb-2">
        <span>{course.title}</span>

        <button
          onClick={() => handleDeleteCourse(course.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>

);
};

export default AdminPage;
