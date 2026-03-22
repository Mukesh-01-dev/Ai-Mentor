import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import toast from "react-hot-toast";
import Header from "../components/Header";
import API_BASE_URL from "../lib/api";

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
  const [subtopics, setSubtopics] = useState([{ title: '', goal: '', topics: [''], tools: [''], activities: [''], assignment: '', activity: '' }]);
  const [newLessons, setNewLessons] = useState([{ id: '', title: '', duration: '', completed: false, playing: false, type: 'video' }]);
  const [selectedModule, setSelectedModule] = useState('');
  const [newModules, setNewModules] = useState([{ id: '', title: '' }]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newCourse, id: parseInt(newCourse.id), rating: parseFloat(newCourse.rating) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add course');
      }

      await fetchCourses(); // Refresh list
      setNewCourse({ id: '', title: '', category: '', level: '', rating: 4.5, students: '0 students', lessons: '0 lessons', price: '₹0', image: '', categoryColor: 'bg-blue-100 text-blue-600' });
      toast.success('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleManageCourse = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      if (response.ok) {
        const fullCourse = await response.json();
        setSelectedCourse(fullCourse);
      } else {
        toast.error('Failed to fetch course details');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      await fetchCourses(); // Refresh list
      toast.success('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleUpdateVideo = async () => {
    if (!selectedLesson || !videoUrl) {
      toast.error('Please select a lesson and enter a video URL');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}/lessons/${selectedLesson}/video`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ youtubeUrl: videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video URL');
      }
      toast.success('Video URL updated successfully!');
      setVideoUrl('');
      setSelectedLesson('');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleSubtopicChange = (index, field, value) => {
    const updatedSubtopics = [...subtopics];
    updatedSubtopics[index][field] = value;
    setSubtopics(updatedSubtopics);
  };

  const addSubtopicField = () => {
    setSubtopics([...subtopics, { title: '', goal: '', topics: [''], tools: [''], activities: [''], assignment: '', activity: '' }]);
  };

  const handleAddSubtopics = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}/subtopics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subtopics }),
      });

      if (!response.ok) {
        throw new Error('Failed to add subtopics');
      }
      toast.success('Subtopics added successfully!');
      setSubtopics([{ title: '', goal: '', topics: [''], tools: [''], activities: [''], assignment: '', activity: '' }]);
    } catch (error) {
      console.error('Error adding subtopics:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...newLessons];
    updatedLessons[index][field] = value;
    setNewLessons(updatedLessons);
  };

  const addLessonField = () => {
    setNewLessons([...newLessons, { id: '', title: '', duration: '', completed: false, playing: false, type: 'video' }]);
  };

  const handleAddLessons = async () => {
    if (!selectedModule) {
      toast.error('Please select a module');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}/modules/${selectedModule}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessons: newLessons }),
      });

      if (!response.ok) {
        throw new Error('Failed to add lessons');
      }
      toast.success('Lessons added successfully!');
      setNewLessons([{ id: '', title: '', duration: '', completed: false, playing: false, type: 'video' }]);
      setSelectedModule('');
      await handleManageCourse(selectedCourse.id); // Refresh course data to include new lessons
    } catch (error) {
      console.error('Error adding lessons:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />
      <Sidebar activePage="admin" />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}`}>
        <main className="flex-1 mt-16 overflow-x-hidden overflow-y-auto bg-canvas-alt p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-main">Admin Panel - Course Management</h1>

            {/* Add Course Form */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="number" name="id" value={newCourse.id} onChange={handleInputChange} placeholder="Course ID (e.g., 4)" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="title" value={newCourse.title} onChange={handleInputChange} placeholder="Title" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="category" value={newCourse.category} onChange={handleInputChange} placeholder="Category" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="level" value={newCourse.level} onChange={handleInputChange} placeholder="Level" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="number" step="0.1" name="rating" value={newCourse.rating} onChange={handleInputChange} placeholder="Rating" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="students" value={newCourse.students} onChange={handleInputChange} placeholder="Students (e.g., 1.2k students)" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="lessons" value={newCourse.lessons} onChange={handleInputChange} placeholder="Lessons (e.g., 15 lessons)" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="price" value={newCourse.price} onChange={handleInputChange} placeholder="Price (e.g., ₹999)" required className="p-2 border border-border rounded bg-input text-main" />
                <input type="text" name="image" value={newCourse.image} onChange={handleInputChange} placeholder="Image URL" required className="p-2 border border-border rounded bg-input text-main col-span-1 md:col-span-2" />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 col-span-1 md:col-span-3">Add Course</button>
              </form>
            </div>

            {/* Course List */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Existing Courses</h2>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-bold">{course.title} (ID: {course.id})</h3>
                      <p className="text-sm text-muted">{course.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleManageCourse(course.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Manage
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Management Modal */}
            {selectedCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-card p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Manage Course: {selectedCourse.title}</h2>
                    <button onClick={() => setSelectedCourse(null)} className="text-muted hover:text-gray-700">×</button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('modules')} className={`px-4 py-2 ${activeTab === 'modules' ? 'border-b-2 border-blue-500' : ''}`}>Modules</button>
                    <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 ${activeTab === 'videos' ? 'border-b-2 border-blue-500' : ''}`}>Video URLs</button>
                    <button onClick={() => setActiveTab('subtopics')} className={`px-4 py-2 ${activeTab === 'subtopics' ? 'border-b-2 border-blue-500' : ''}`}>Subtopics</button>
                    <button onClick={() => setActiveTab('lessons')} className={`px-4 py-2 ${activeTab === 'lessons' ? 'border-b-2 border-blue-500' : ''}`}>Lessons</button>
                  </div>

                  {/* Modules Tab */}
                  {activeTab === 'modules' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add Modules to Course</h3>
                      <div className="space-y-4">
                        {newModules.map((module, index) => (
                          <div key={index} className="border p-4 rounded">
                            <input
                              type="text"
                              placeholder="Module ID"
                              value={module.id}
                              onChange={(e) => {
                                const updatedModules = [...newModules];
                                updatedModules[index].id = e.target.value;
                                setNewModules(updatedModules);
                              }}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Module Title"
                              value={module.title}
                              onChange={(e) => {
                                const updatedModules = [...newModules];
                                updatedModules[index].title = e.target.value;
                                setNewModules(updatedModules);
                              }}
                              className="w-full p-2 border border-border rounded bg-input text-main"
                            />
                          </div>
                        ))}
                        <button onClick={() => setNewModules([...newModules, { id: '', title: '' }])} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Another Module</button>
                        <button onClick={async () => {
                          const token = localStorage.getItem('token');
                          try {
                            const response = await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}/modules`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ modules: newModules }),
                            });

                            if (!response.ok) {
                              throw new Error('Failed to add modules');
                            }
                            toast.success('Modules added successfully!');
                            setNewModules([{ id: '', title: '' }]);
                            await handleManageCourse(selectedCourse.id); // Refresh course data to include new modules
                          } catch (error) {
                            console.error('Error adding modules:', error);
                            toast.error(`Error: ${error.message}`);
                          }
                        }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2">Save Modules</button>
                      </div>
                    </div>
                  )}

                  {/* Video URLs Tab */}
                  {activeTab === 'videos' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Update Lesson Video URLs</h3>
                      <div className="space-y-4">
                        <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} className="w-full p-2 border border-border rounded bg-input text-main">
                          <option value="">Select a lesson</option>
                          {selectedCourse.modules?.map(module =>
                            module.lessons?.map(lesson => (
                              <option key={lesson.id} value={lesson.id}>{module.title} - {lesson.title}</option>
                            ))
                          )}
                        </select>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="Enter YouTube URL"
                          className="w-full p-2 border border-border rounded bg-input text-main"
                        />
                        <button onClick={handleUpdateVideo} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Update Video URL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subtopics Tab */}
                  {activeTab === 'subtopics' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add Subtopics</h3>
                      <div className="space-y-4">
                        {subtopics.map((subtopic, index) => (
                          <div key={index} className="border p-4 rounded">
                            <input
                              type="text"
                              placeholder="Subtopic Title"
                              value={subtopic.title}
                              onChange={(e) => handleSubtopicChange(index, 'title', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Goal"
                              value={subtopic.goal}
                              onChange={(e) => handleSubtopicChange(index, 'goal', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <textarea
                              placeholder="Topics (comma separated)"
                              value={subtopic.topics.join(', ')}
                              onChange={(e) => handleSubtopicChange(index, 'topics', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <textarea
                              placeholder="Tools (comma separated)"
                              value={subtopic.tools.join(', ')}
                              onChange={(e) => handleSubtopicChange(index, 'tools', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <textarea
                              placeholder="Activities (comma separated)"
                              value={subtopic.activities.join(', ')}
                              onChange={(e) => handleSubtopicChange(index, 'activities', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Assignment"
                              value={subtopic.assignment}
                              onChange={(e) => handleSubtopicChange(index, 'assignment', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Activity"
                              value={subtopic.activity}
                              onChange={(e) => handleSubtopicChange(index, 'activity', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main"
                            />
                          </div>
                        ))}
                        <button onClick={addSubtopicField} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Another Subtopic</button>
                        <button onClick={handleAddSubtopics} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2">Save Subtopics</button>
                      </div>
                    </div>
                  )}

                  {/* Lessons Tab */}
                  {activeTab === 'lessons' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add Lessons to Module</h3>
                      <div className="space-y-4">
                        <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} className="w-full p-2 border border-border rounded bg-input text-main">
                          <option value="">Select a module</option>
                          {selectedCourse.modules?.map(module => (
                            <option key={module.id} value={module.id}>{module.title}</option>
                          ))}
                        </select>
                        {newLessons.map((lesson, index) => (
                          <div key={index} className="border p-4 rounded">
                            <input
                              type="text"
                              placeholder="Lesson ID"
                              value={lesson.id}
                              onChange={(e) => handleLessonChange(index, 'id', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Lesson Title"
                              value={lesson.title}
                              onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Duration"
                              value={lesson.duration}
                              onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                              className="w-full p-2 border border-border rounded bg-input text-main"
                            />
                          </div>
                        ))}
                        <button onClick={addLessonField} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Another Lesson</button>
                        <button onClick={handleAddLessons} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2">Save Lessons</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
