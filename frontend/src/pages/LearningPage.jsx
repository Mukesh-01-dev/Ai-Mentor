import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAIVideo } from "../service/aiService";

import {
  ChevronLeft,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  FileText,
  CloudCog,
} from "lucide-react";

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function Learning() {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [learningData, setLearningData] = useState(null);
  const [expandedModule, setExpandedModule] = useState("module-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [celebritySearch, setCelebritySearch] = useState("");

  // Captions state
  const [captions, setCaptions] = useState([]);
  const [activeCaption, setActiveCaption] = useState("");
  const celebrities = ["Salman Khan", "Modi ji", "SRK"];
  const celebrityVideoMap = {
    "Salman Khan": "/videos/salman.mp4",
    "Modi ji": "/videos/modi.mp4",
    "SRK": "/videos/srk.mp4",
  };

  const [selectedCelebrity, setSelectedCelebrity] = useState(null);

  // When user requested single-word subtitles for the Reactjs paragraph,
  // we'll split into words and compute word-by-word cues when video duration is known.
  // const Reactjs_PARAGRAPH = `Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAIVideoLoading, setIsAIVideoLoading] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);



  useEffect(() => {
    // Check if user has purchased this course
    // const hasPurchased = user?.purchasedCourses?.some(course => course.courseId === parseInt(courseId));
    // if (!hasPurchased) {
    //   navigate('/courses');
    //   return;
    // }

    const fetchLearningData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/courses/${courseId}/learning`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const courseData = await response.json();
          console.log(courseData);
          setLearningData(courseData);
          // Load user's progress for this course
          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;
          if (userProgress) {
            setExpandedModule(
              userProgress.currentLesson?.moduleTitle || "module-1"
            );
            // Set current lesson based on progress
            const currentLesson = userProgress.currentLesson;
            if (currentLesson) {
              // Find and set the current lesson
              const lesson = courseData.modules
                .flatMap((module) => module.lessons)
                .find((l) => l.id === currentLesson.lessonId);
              if (lesson) {
                setLearningData((prev) => ({
                  ...prev,
                  currentLesson: lesson,
                }));
              }
            }
          }
        } else {
          console.error(
            "Failed to fetch course learning data, using local fallback"
          );
          // Fallback local data so the learning page works without backend
          const fallback = {
            course: {
              id: parseInt(courseId),
            },
            modules: [
              {
                id: "module-1",
                title: "Module 1",
                lessons: [
                  {
                    id: 1,
                    title: "Introduction to Reactjs",
                    type: "video",
                    duration: "0:10",
                    videoUrl: "/videos/salman.mp4",
                    content: {
                      introduction:
                        "Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.",
                      keyConcepts: [],
                    },
                  },
                  {
                    id: 2,
                    title: "Reactjs: Advanced Concepts",
                    type: "video",
                    duration: "0:12",
                    videoUrl: "/videos/salman.mp4",
                    content: {
                      introduction:
                        "Continuation video for Reactjs advanced concepts.",
                      keyConcepts: [],
                    },
                  },
                ],
              },
            ],
            currentLesson: {
              id: 1,
            },
          };

          // If we have user progress, try to set the exact lesson from fallback
          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;
          if (userProgress && userProgress.currentLesson) {
            const lesson = fallback.modules
              .flatMap((m) => m.lessons)
              .find((l) => l.id === userProgress.currentLesson.lessonId);
            if (lesson) {
              setLearningData({ ...fallback, currentLesson: lesson });
            } else {
              setLearningData(fallback);
            }
          } else {
            setLearningData(fallback);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching learning data, using local fallback:",
          error
        );
        const fallback = {
          course: {
            id: parseInt(courseId),
            title: "Local Demo Course",
          },
          modules: [
            {
              id: "module-1",
              title: "Module 1",
              lessons: [
                {
                  id: 1,
                  title: "Introduction to Reactjs",
                  type: "video",
                  duration: "0:10",
                  videoUrl: "/vdo1.mp4",
                  content: {
                    introduction:
                      "Reactjs is a high-level, object-oriented programming language that was originally developed by Sun Microsystems in 1995 and is now owned by Oracle Corporation. It is designed to be platform-independent, meaning that Reactjs code can run on any device that has a Reactjs Virtual Machine (JVM), making it highly versatile for developing cross-platform applications. Reactjs emphasizes object-oriented principles, such as encapsulation, inheritance and polymorphism, which allow developers to create modular, reusable and maintainable code. It has a strong memory management system, including automatic garbage collection, which reduces the likelihood of memory leaks.",
                    keyConcepts: [],
                  },
                },
                {
                  id: 2,
                  title: "Reactjs: Advanced Concepts",
                  type: "video",
                  duration: "0:12",
                  videoUrl: "/vdo2.mp4",
                  content: {
                    introduction:
                      "Continuation video for Reactjs advanced concepts.",
                    keyConcepts: [],
                  },
                },
              ],
            },
          ],
          currentLesson: {
            id: 1,
          },
        };

        // If we have user progress, try to set the exact lesson from fallback
        const userProgress = user?.purchasedCourses?.find(
          (course) => course.courseId === parseInt(courseId)
        )?.progress;
        if (userProgress && userProgress.currentLesson) {
          const lesson = fallback.modules
            .flatMap((m) => m.lessons)
            .find((l) => l.id === userProgress.currentLesson.lessonId);
          if (lesson) {
            setLearningData({ ...fallback, currentLesson: lesson });
          } else {
            setLearningData(fallback);
          }
        } else {
          setLearningData(fallback);
        }
      }
    };
    fetchLearningData();
  }, [courseId, user, navigate]);

  // Load and parse VTT captions (simple parser) when selectedCelebrity changes
  useEffect(() => {
    const loadCaptions = async () => {
      try {
        const vttPath =
          "/vdo_subtitles.vtt";
        const res = await fetch(vttPath);
        if (!res.ok) {
          setCaptions([]);
          return;
        }
        const text = await res.text();
        const blocks = text.replace(/\r\n/g, "\n").split(/\n\n+/).slice(1); // skip WEBVTT header
        const cues = blocks
          .map((block) => {
            const lines = block
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length < 2) return null;
            const timeLine = lines[0];
            const textLines = lines.slice(1).join(" ");
            const match = timeLine.match(
              /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/
            );
            if (!match) return null;
            const toSeconds = (s) => {
              const [hh, mm, rest] = s.split(":");
              const [ss, ms] = rest.split(".");
              return (
                parseInt(hh) * 3600 +
                parseInt(mm) * 60 +
                parseInt(ss) +
                parseFloat("0." + ms)
              );
            };
            return {
              start: toSeconds(match[1]),
              end: toSeconds(match[2]),
              text: textLines,
            };
          })
          .filter(Boolean);
        setCaptions(cues);
      } catch (err) {
        console.warn("Could not load captions:", err);
        setCaptions([]);
      }
    };

    loadCaptions();
  }, [selectedCelebrity]);

  // Ensure when currentLesson changes we load its video into the player
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !learningData?.currentLesson) return;

    const loadVideo = async () => {
      if (selectedCelebrity) {
        setIsAIVideoLoading(true);
        try {
          const payload = {
            celebrity: selectedCelebrity.split(" ")[0].toLowerCase(),
            course: learningData?.course?.title || learningData?.modules?.[0]?.title || "React JS",
            topic: learningData.currentLesson.title || learningData?.modules?.[0]?.lessons?.[0]?.title || "Welcome to the lesson"
          };
          const data = await getAIVideo(payload);
          if (data && data.videoUrl) {
            setAiVideoUrl(data.videoUrl);
            v.pause();
            v.src = data.videoUrl;
            v.load();
            const p = v.play();
            if (p && typeof p.then === "function") {
              p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(true);
            }
          }
        } catch (error) {
          console.error("Error generating AI video on lesson change:", error);
          const src =
            celebrityVideoMap[selectedCelebrity]?.video ||
            learningData.currentLesson.videoUrl;
          if (src) {
            v.pause();
            v.src = src;
            v.load();
            const p = v.play();
            if (p && typeof p.then === "function") {
              p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else {
              setIsPlaying(true);
            }
          }
        } finally {
          setIsAIVideoLoading(false);
        }
      } else {
        setIsAIVideoLoading(false);
        const src = learningData.currentLesson.videoUrl;
        if (src) {
          v.pause();
          v.src = src;
          v.load();
          setIsPlaying(false); // Lessons don't autoplay by default unless celebrity is selected
        }
      }
    };

    loadVideo();
  }, [learningData?.currentLesson, selectedCelebrity]);


  const { modules, currentLesson } = learningData || {};

  if (!learningData) {
    return <div>Loading...</div>;
  }

  // Flatten modules into a single lessons list and compute current index
  const allLessons = (modules || []).flatMap((module) => module.lessons || []);
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.id === currentLesson?.id
  );

  const completeLesson = async (lessonId) => {
    // Check if lesson is already completed
    const courseProgress = user?.purchasedCourses?.find(
      (course) => course.courseId === parseInt(courseId)
    )?.progress;
    const isAlreadyCompleted = courseProgress?.completedLessons?.some(
      (cl) => cl.lessonId === lessonId
    );

    if (isAlreadyCompleted) {
      console.log("Lesson already completed, skipping");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          completedLesson: { lessonId },
        }),
      });
    } catch (error) {
      console.error("Error marking lesson completed:", error);
    }

    // Also update current lesson pointer
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          currentLesson: {
            lessonId,
            moduleTitle: expandedModule,
          },
        }),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const toggleModule = (id) => {
    setExpandedModule((prev) => (prev === id ? null : id));
  };

  const handleLessonClick = (lesson) => {
    // update current lesson locally and let useEffect handle video loading
    setLearningData((prev) => ({ ...prev, currentLesson: lesson }));
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      handleLessonClick(prevLesson);
    }
  };

  const handleNext = async () => {
    if (currentLessonIndex >= allLessons.length - 1) return;
    setIsNavigating(true);
    // mark current as completed
    if (currentLesson?.id) await completeLesson(currentLesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    handleLessonClick(nextLesson);
    setIsNavigating(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p && typeof p.then === "function") {
          p.then(() => setIsPlaying(true)).catch((err) => {
            console.warn("Play was blocked:", err);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(true);
        }
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      setDuration(duration);
      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
      // update visible caption overlay
      if (captions.length > 0) {
        const cue = captions.find(
          (c) => currentTime >= c.start && currentTime <= c.end
        );
        setActiveCaption(cue ? cue.text : "");
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.target.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto z-10">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {learningData?.course?.title || learningData?.title || "Course"}
            </h2>
            <button
              onClick={() => navigate("/courses")}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Celebrities
            </h3>
            <div className="mb-3">
              <input
                type="search"
                placeholder="Search celebrities..."
                value={celebritySearch}
                onChange={(e) => setCelebritySearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              {celebrities
                .filter((c) =>
                  c.toLowerCase().includes(celebritySearch.trim().toLowerCase())
                )
                .map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      if (selectedCelebrity === c) {
                        // Toggle off if same celebrity clicked again
                        setSelectedCelebrity(null);
                        setAiVideoUrl(null);
                      } else {
                        setSelectedCelebrity(c);
                      }
                    }}
                    className={`w-full text-left px-6 py-3 rounded-lg border ${selectedCelebrity === c
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                      }`}
                  >
                    {c}
                  </button>
                ))}
            </div>
          </div>

          <div className="mb-6">
            {(() => {
              const completedCount =
                user?.purchasedCourses?.find(
                  (course) => course.courseId === parseInt(courseId)
                )?.progress?.completedLessons?.length || 0;
              const totalCount = allLessons.length;
              const progressPercent = Math.min(
                (completedCount / totalCount) * 100,
                100
              );
              console.log("Progress calculation:", {
                completedCount,
                totalCount,
                progressPercent,
              });
              return (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round(progressPercent)}% Complete
                  </p>
                </>
              );
            })()}
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 flex-1 mt-16">
        <main className="py-8">
          <div className="grid grid-cols-12 gap-7">
            <div className="col-span-8 space-y-6">
              {/* Video Player */}
              <div
                ref={playerContainerRef}
                className="relative bg-black rounded-lg overflow-hidden group"
                style={{ aspectRatio: "16/9" }}
              >

                {currentLesson?.youtubeUrl ? (
                  <iframe
                    key={currentLesson.id}
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                      currentLesson.youtubeUrl
                    )}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentLesson.title}
                  ></iframe>
                ) : (
                  <video
                    key={aiVideoUrl || currentLesson?.videoUrl}
                    ref={videoRef}
                    src={
                      aiVideoUrl ||
                      (selectedCelebrity &&
                        celebrityVideoMap[selectedCelebrity] &&
                        celebrityVideoMap[selectedCelebrity].video) ||
                      currentLesson?.videoUrl
                    }
                    className="w-full h-full object-contain bg-black"
                    onTimeUpdate={handleProgress}
                    onLoadedMetadata={handleProgress}
                    onEnded={() => {
                      setIsPlaying(false);
                    }}
                    controls={false}
                    playsInline
                    preload="metadata"
                  />
                )}

                {isAIVideoLoading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                    <p className="text-white text-lg animate-pulse">
                      Loading {selectedCelebrity} video...
                    </p>
                  </div>
                )}
                {/* Caption overlay (custom) */}
                {activeCaption && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16 px-4 py-2 bg-black/70 text-white rounded-md max-w-3xl text-center">
                    <p className="text-sm leading-relaxed">{activeCaption}</p>
                  </div>
                )}

                {/* Video Controls - Only show for local videos, not YouTube */}
                {!currentLesson?.youtubeUrl && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-white text-sm">
                          {formatTime(currentTime)}
                        </span>
                        <div
                          className="flex-1 h-1 bg-gray-600 rounded-lg cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div
                            className="h-full bg-white rounded-lg"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:scale-110 transition-transform"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-white"
                        />
                      </div>

                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-5 h-5" />
                        ) : (
                          <Maximize className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MODULE BELOW VIDEO */}
              <div className="space-y-2">
                {(() => {
                  const q = searchQuery.trim().toLowerCase();
                  const filteredModules = (modules || [])
                    .map((module) => ({
                      ...module,
                      lessons: module.lessons.filter((lesson) =>
                        lesson.title.toLowerCase().includes(q)
                      ),
                    }))
                    .filter((m) => m.lessons.length > 0);

                  if (q && filteredModules.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        No results for "{searchQuery}"
                      </p>
                    );
                  }

                  return (
                    filteredModules.length > 0 ? filteredModules : modules || []
                  ).map((module) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">
                          {module.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expandedModule === module.id ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {expandedModule === module.id && (
                        <div className="px-4 pb-4 space-y-2">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-grey-50 ${currentLesson?.id === lesson.id
                                ? "bg-blue-600 text-white-20"
                                : "bg-white text-gray-900"
                                }`}
                            >
                              {lesson.type === "video" ? (
                                <Play className="w-4 h-4 text-gray-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-white-500">
                                  {lesson.duration}
                                </p>
                              </div>
                              {user?.purchasedCourses
                                ?.find(
                                  (course) => course.courseId === parseInt(courseId)
                                )
                                ?.progress?.completedLessons?.some(
                                  (cl) => cl.lessonId === lesson.id
                                ) ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* ================= RIGHT SIDE ================= */}
            <div className="col-span-4 space-y-6">

              {/* ===== BOX 1 — LESSON INFO ===== */}
              <div className="bg-white p-2 rounded-xl border border-blue-300 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentLesson?.title}
                </h2>

                {/* scrollable introduction */}
                <div className="mt-4 max-h-40 overflow-y-auto pr-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentLesson?.content?.introduction}
                  </p>
                </div>
              </div>

              {/* ===== BOX 2 — AUDIO / VIDEO CONTROL ===== */}
              <div className="bg-white p-3 rounded-xl border border-blue-300 shadow-lg space-y-3">
                {/* play fullscreen */}
                <div className="flex justify-between ">
                  <button
                    onClick={togglePlay}
                    className="px-4 bg-blue-600 text-white py-1 rounded-md font-medium">
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md">
                    ⛶
                  </button>
                </div>

                {/* progress bar */}
                <div>
                  <div
                    onClick={handleSeek}
                    className="w-full h-2 bg-grey-200 dark:bg-grey-600 rounded cursor-pointer">
                    <div
                      className="h-2 bg-blue-600 dark:bg-sky-400 rounded transition-all"
                      style={{ width: `${progress}%` }} />
                  </div>

                  {/* time */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* volume */}
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute}>
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* ===== BOX 3 — PREVIOUS / NEXT ===== */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex <= 0}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-md disabled:opacity-50"
                >
                  ← Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={
                    currentLessonIndex >= allLessons.length - 1 || isNavigating
                  }
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div >
  );
}
