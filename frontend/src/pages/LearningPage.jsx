import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getAIVideo } from "../service/aiService";
import VideoPlayer from "../components/video/VideoPlayer";
import AITranscript from "../components/video/AITranscript";

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  FileText,
  Search,
  Home,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Eye,
  User,
  X,
  Sparkles,
} from "lucide-react";

// Sanitize filename to match backend logic: remove [\\/:*?"<>|], replace spaces with _
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_");
}

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function Learning() {


  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const { user, updateUser } = useAuth();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [learningData, setLearningData] = useState(null)
  const [expandedModule, setExpandedModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [celebritySearch, setCelebritySearch] = useState("");
  const [activeTab, setActiveTab] = useState("transcript");
  const [isCelebrityModalOpen, setIsCelebrityModalOpen] = useState(false);

  // Captions state
  const [captions, setCaptions] = useState([]);
  const [activeCaption, setActiveCaption] = useState("");
  const celebrities = ["Salman Khan", "Modi ji", "SRK"];

  // map celebrities to videos and vtt files
  const celebrityVideoMap = {
    "Salman Khan": { video: "/videos/salman.mp4", vtt: "/videos/salman.vtt" },
    "Modi ji": { video: "/videos/modi.mp4", vtt: "/videos/modi.vtt" },
    SRK: { video: "/videos/srk.mp4", vtt: "/videos/srk.vtt" },
  };

  const [selectedCelebrity, setSelectedCelebrity] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState(null);
  const [aiTranscript, setAiTranscript] = useState(null);
  const [isAIVideoLoading, setIsAIVideoLoading] = useState(false);
  const [generatedTextContent, setGeneratedTextContent] = useState("");

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const activeCaptionRef = useRef(null);
  const modalRef = useRef(null);
  const lastLessonIdRef = useRef(null);
  const lastCelebrityRef = useRef(null);
  const hasRestoredProgressRef = useRef(false);

  // Auto-scroll transcript to keep active caption visible
  useEffect(() => {
    if (activeCaptionRef.current && transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      const activeElement = activeCaptionRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      const elementTopRelative = elementRect.top - containerRect.top + container.scrollTop;
      const targetScrollTop = elementTopRelative - container.clientHeight / 2 + activeElement.clientHeight / 2;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elementTop = elementRect.top - containerRect.top + container.scrollTop;
      const elementBottom = elementTop + activeElement.clientHeight;

      // Scroll if element is not fully visible
      if (elementTop < containerTop || elementBottom > containerBottom) {
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }
  }, [currentTime]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCelebrityModalOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal on escape key
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsCelebrityModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

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
          setLearningData(courseData);
          // Load user's progress for this course
          // Hydrate the currentLesson: find its full details in the modules list
          // This ensures we get the 'type' property even if the initial object is partial
          const findFullLesson = (id) => {
            return courseData.modules
              .flatMap(m => m.lessons)
              .find(l => l.id === id);
          };

          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;

          let initialLesson = null;

          if (userProgress?.currentLesson?.lessonId) {
            initialLesson = findFullLesson(userProgress.currentLesson.lessonId);
          }

          // If no progress or lesson not found, fallback to the course's default currentLesson 
          // or the very first lesson of the first module
          if (!initialLesson) {
            const defaultId = courseData.currentLesson?.id || courseData.modules?.[0]?.lessons?.[0]?.id;
            initialLesson = findFullLesson(defaultId);
          }

          if (initialLesson) {
            courseData.currentLesson = initialLesson;
          }

          setLearningData(courseData);

          if (userProgress) {
            // Do NOT setExpandedModule here; dropdown should be closed by default
            // Set current lesson based on progress
            const currentLesson = userProgress.currentLesson;
            if (currentLesson && !hasRestoredProgressRef.current) {
              // Find and set the current lesson
              const lesson = courseData.modules
                .flatMap((module) => module.lessons)
                .find((l) => l.id === currentLesson.lessonId);

              if (lesson) {
                hasRestoredProgressRef.current = true;
                // Restore saved AI content if it exists
                const savedData = userProgress.lessonData?.[lesson.id];
                if (savedData?.generatedTextContent) {
                  setGeneratedTextContent(savedData.generatedTextContent);
                  if (savedData.aiVideoUrl) {
                    setAiVideoUrl(savedData.aiVideoUrl);
                  }
                  if (savedData.celebrity) {
                    setSelectedCelebrity(savedData.celebrity);
                    lastCelebrityRef.current = savedData.celebrity;
                  }
                }

                setLearningData((prev) => ({
                  ...prev,
                  currentLesson: lesson,
                }));
              }
            }
          }
        } else {
          setLearningData(null);
        }
      } catch (error) {
        setLearningData(null);
      }
    };
    fetchLearningData();
  }, [courseId]);

  // Reset restore flag when course changes
  useEffect(() => {
    hasRestoredProgressRef.current = false;
  }, [courseId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const generateFromText = (d) => {
      if (!generatedTextContent) return false;
      const sentences = generatedTextContent
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (!sentences.length) return false;
      const timePerSentence = d / sentences.length;
      setCaptions(sentences.map((text, i) => ({
        start: i * timePerSentence,
        end: (i + 1) * timePerSentence,
        text,
      })));
      console.log(`✅ Generated ${sentences.length} captions from AI text`);
      return true;
    };

    const loadVTT = async () => {
      const vttPath = selectedCelebrity ? celebrityVideoMap[selectedCelebrity]?.vtt : null;
      if (!vttPath) { setCaptions([]); return; }
      try {
        const res = await fetch(vttPath);
        if (!res.ok) { setCaptions([]); return; }
        const text = await res.text();
        const blocks = text.replace(/\r\n/g, "\n").split(/\n\n+/).slice(1);
        const toSeconds = (s) => {
          const parts = s.split(":");
          if (parts.length === 3) {
            const [hh, mm, rest] = parts;
            const [ss, ms] = rest.split(".");
            return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(ss) + parseFloat("0." + (ms || "0"));
          } else {
            const [mm, rest] = parts;
            const [ss, ms] = rest.split(".");
            return parseInt(mm) * 60 + parseInt(ss) + parseFloat("0." + (ms || "0"));
          }
        };
        const cues = blocks.map((block) => {
          const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) return null;
          const match = lines[0].match(
            /(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})/
          );
          if (!match) return null;
          return { start: toSeconds(match[1]), end: toSeconds(match[2]), text: lines.slice(1).join(" ") };
        }).filter(Boolean);
        console.log(`✅ Parsed ${cues.length} captions from VTT`);
        setCaptions(cues);
      } catch (err) {
        setCaptions([]);
      }
    };

    const tryGenerate = () => {
      const d = video.duration;
      if (!isFinite(d) || d <= 0) return false;
      return generateFromText(d);
    };

    // ✅ Key fix: if generatedTextContent just arrived and video is already loaded, generate now
    if (generatedTextContent) {
      if (tryGenerate()) return; // video already loaded, captions generated ✅
      // Video not loaded yet — wait for it
      const handler = () => { generateFromText(video.duration); };
      video.addEventListener("loadedmetadata", handler, { once: true });
      return () => video.removeEventListener("loadedmetadata", handler);
    }

    // No AI text — try VTT once video is ready
    setCaptions([]);
    setActiveCaption("");
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      loadVTT();
    } else {
      const handler = () => { loadVTT(); };
      video.addEventListener("loadedmetadata", handler, { once: true });
      return () => video.removeEventListener("loadedmetadata", handler);
    }

  }, [selectedCelebrity, generatedTextContent, learningData?.currentLesson?.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !learningData?.currentLesson) return;

    const lessonChanged = lastLessonIdRef.current !== learningData.currentLesson.id;
    const celebrityChanged = lastCelebrityRef.current !== selectedCelebrity;

    if (!lessonChanged && !celebrityChanged && v.src) return;

    lastLessonIdRef.current = learningData.currentLesson.id;
    lastCelebrityRef.current = selectedCelebrity;

    const loadVideo = async () => {
      setCaptions([]);
      setActiveCaption("");

      if (selectedCelebrity) {
        const savedData = user?.purchasedCourses
          ?.find(c => c.courseId === parseInt(courseId))
          ?.progress?.lessonData?.[learningData.currentLesson.id];

        const hasSavedMatchingContent = savedData?.celebrity === selectedCelebrity && savedData?.generatedTextContent;

        if (hasSavedMatchingContent) {
          console.log("♻️ Using saved matching AI content, skipping fetch");
          if (!aiVideoUrl) {
            setGeneratedTextContent(savedData.generatedTextContent);
            setAiVideoUrl(savedData.aiVideoUrl);
          }
          setIsPlaying(false);
          return;
        }

        // Fresh fetch
        setIsAIVideoLoading(true);
        setGeneratedTextContent("");
        setAiVideoUrl(null);

        try {
          const payload = {
            courseId: parseInt(courseId),
            lessonId: learningData.currentLesson.id,
            celebrity: selectedCelebrity.split(" ")[0].toLowerCase(),
          };

          const data = await getAIVideo(payload);

          if (data?.videoUrl) {
            let isReady = data.cached || false;
            let attempts = 0;

            if (!isReady) {
              console.log("⏳ Video not cached. Polling for status...");
              while (!isReady && attempts < 60) {
                const statusRes = await fetch(`/api/ai/status/${data.jobId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const { status } = await statusRes.json();
                if (status === "ready") { isReady = true; break; }
                if (status === "failed") throw new Error("Video generation failed on server.");
                attempts++;
                await new Promise(r => setTimeout(r, 1000));
              }
            } else {
              console.log("⚡ Video served from cache. Skipping polling.");
            }

            if (!isReady) throw new Error("Video generation timed out.");

            // Guard: user may have navigated away during polling
            if (lastLessonIdRef.current !== learningData.currentLesson.id ||
              lastCelebrityRef.current !== selectedCelebrity) {
              console.log("🚫 Context changed during polling. Skipping update.");
              return;
            }

            setAiVideoUrl(data.videoUrl);

            if (data.transcriptName) {
              try {
                const trRes = await fetch(`/api/ai/transcript/${data.transcriptName}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (trRes.ok) {
                  const trData = await trRes.json();
                  setGeneratedTextContent(trData.content);
                }
              } catch (trErr) {
                console.error("Error fetching transcript:", trErr);
              }
            }

            setIsPlaying(true);
            saveLessonData(learningData.currentLesson.id, {
              generatedTextContent: data.textContent || "",
              aiVideoUrl: data.videoUrl,
              celebrity: selectedCelebrity,
            });
          }
        } catch (error) {
          console.error("Error generating AI video:", error);
          setGeneratedTextContent("");
          setAiVideoUrl(null);
          setIsPlaying(false);
        } finally {
          setIsAIVideoLoading(false);
        }

      } else {
        // No celebrity — let VideoPlayer handle src via its useEffect
        setIsAIVideoLoading(false);
        setGeneratedTextContent("");
        setAiVideoUrl(null); // ✅ VideoPlayer will fall through to currentLesson.videoUrl
        setIsPlaying(false);
      }
    };

    loadVideo();
  }, [learningData?.currentLesson?.id, selectedCelebrity]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange"
    ];

    events.forEach(event => document.addEventListener(event, handleFullscreenChange));

    // Support for iOS video element specifically
    const video = videoRef.current;
    if (video) {
      video.addEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
      video.addEventListener('webkitendfullscreen', () => setIsFullscreen(false));
    }

    return () => {
      events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
        video.removeEventListener('webkitendfullscreen', () => setIsFullscreen(false));
      }
    };
  }, [videoRef]);




  // If selectedCelebrity is Salman Khan and the user wants the Reactjs paragraph
  // shown word-by-word, create per-word cues when video metadata (duration) is available.
  // useEffect(() => {
  //   const v = videoRef.current;
  //   if (!v) return;

  //   const createWordCues = () => {
  //     if (selectedCelebrity !== "Salman Khan") return;
  //     const words = Reactjs_PARAGRAPH.split(/\s+/).filter(Boolean);
  //     if (
  //       !words.length ||
  //       !v.duration ||
  //       !isFinite(v.duration) ||
  //       v.duration <= 0
  //     )
  //       return;
  //     const per = v.duration / words.length;
  //     const cues = words.map((w, i) => ({
  //       start: i * per,
  //       end: (i + 1) * per,
  //       text: w,
  //     }));
  //     setCaptions(cues);
  //   };

  //   // If metadata already loaded, create cues immediately
  //   if (v.duration && isFinite(v.duration) && v.duration > 0) {
  //     createWordCues();
  //   }

  //   v.addEventListener("loadedmetadata", createWordCues);
  //   return () => v.removeEventListener("loadedmetadata", createWordCues);
  // }, [selectedCelebrity, videoRef.current]);

  const { modules, currentLesson } = learningData || {};

  if (!learningData) {
    return (
      <div className="min-h-screen bg-canvas-alt flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Flatten modules into a single lessons list and compute current index
  const allLessons = (modules || []).flatMap((module) => module.lessons || []);
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.id === currentLesson?.id
  );

  const saveLessonData = async (lessonId, data) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          lessonData: {
            lessonId,
            data
          },
          currentLesson: {
            lessonId,
            moduleTitle: modules.find(m => m.id === expandedModule)?.title || ""
          }
        }),
      });
      if (res.ok) {
        const result = await res.json();
        // Update user context to reflect changes
        if (updateUser && result.purchasedCourses) {
          updateUser({ purchasedCourses: result.purchasedCourses });
        }
      }
    } catch (error) {
      console.error("Error saving lesson data:", error);
    }
  };

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
      const res = await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          completedLesson: { lessonId },
          currentLesson: {
            lessonId,
            moduleTitle: modules.find(m => m.id === expandedModule)?.title || expandedModule || "",
          },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (updateUser && result.purchasedCourses) {
          updateUser({ purchasedCourses: result.purchasedCourses });
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const toggleModule = (id) => {
    setExpandedModule((prev) => (prev === id ? null : id));
  };

  const handleLessonClick = (lesson) => {
    // If clicking the same lesson, do nothing
    if (currentLesson?.id === lesson.id) return;

    // update current lesson locally and let useEffect handle video loading
    setGeneratedTextContent(null);
    setAiVideoUrl(null);
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
      const vidDuration = videoRef.current.duration;
      const vidCurrentTime = videoRef.current.currentTime;

      if (isFinite(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
      }

      setCurrentTime(vidCurrentTime);
      setProgress(vidDuration > 0 ? (vidCurrentTime / vidDuration) * 100 : 0);

      // update visible caption overlay
      if (captions.length > 0) {
        const cue = captions.find(
          (c) => vidCurrentTime >= c.start && vidCurrentTime <= c.end
        );
        const targetText = cue ? cue.text : "";
        if (activeCaption !== targetText) {
          setActiveCaption(targetText);
        }
      }
    }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;

    const vidDuration = v.duration; // ✅ read from element directly, not state
    if (!isFinite(vidDuration) || vidDuration <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * vidDuration;

    v.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const handleTranscriptClick = (startTime) => {
    const v = videoRef.current;
    if (!v) return;

    const vidDuration = v.duration; // ✅ read from element directly, not state

    v.currentTime = startTime;
    setCurrentTime(startTime);

    if (isFinite(vidDuration) && vidDuration > 0) {
      setProgress((startTime / vidDuration) * 100);
    }

    if (!isPlaying) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch((err) => {
          console.warn("Play blocked:", err);
        });
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    const isFull = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (!isFull) {
      const requestMethod =
        container.requestFullscreen ||
        container.webkitRequestFullscreen ||
        container.mozRequestFullScreen ||
        container.msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(container).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      const exitMethod =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

      if (exitMethod) {
        exitMethod.call(document);
      }
    }
  };

  const formatTime = (time) => {
    if (time === undefined || time === null || Object.is(time, NaN) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(Math.abs(time) / 60);
    const seconds = Math.floor(Math.abs(time) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-canvas-alt flex flex-col">
      <Header />

      <Sidebar activePage="courses" />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          }`}
      >
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border px-6 py-3 mt-20 grid grid-flow-col-dense">
          <div className="flex items-center gap-2 text-sm text-muted mt-2">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-muted" />
            <button
              onClick={() => navigate("/courses")}
              className="hover:text-blue-600 transition-colors"
            >
              My Course
            </button>
            <ChevronRight className="w-4 h-4 text-muted" />
            {/* Show current module name instead of course title */}
            <button
              className="hover:text-blue-600 transition-colors"
              disabled
              style={{ cursor: 'default', opacity: 1, fontWeight: 600 }}
            >
              {(() => {
                if (modules && currentLesson) {
                  const mod = modules.find(m => m.lessons?.some(l => l.id === currentLesson.id));
                  return mod?.title || 'Module';
                }
                return 'Module';
              })()}
            </button>
            <ChevronRight className="w-4 h-4 text-muted" />
            <span className="text-main font-medium">
              {currentLesson?.title}
            </span>
          </div>


        </div>

        {/* Content Selector with AI Button */}
        <div className="bg-card border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Custom Dropdown for Modules and Lessons */}
            <div className="relative min-w-95 max-w-125 flex items-center">
              <span className="text-main font-semibold mr-3">Contents</span>
              <div className="relative w-full">
                <div
                  className="bg-canvas-alt border border-border rounded-2xl px-6 py-2 pr-12 text-base text-main cursor-pointer flex items-center justify-between select-none min-h-12"
                  tabIndex={0}
                  onClick={() => {
                    if (expandedModule) {
                      setExpandedModule(null);
                    } else {
                      // Find the module containing the current lesson
                      if (modules && currentLesson) {
                        const mod = modules.find(m => m.lessons?.some(l => l.id === currentLesson.id));
                        setExpandedModule(mod?.id || null);
                      } else {
                        setExpandedModule(null);
                      }
                    }
                  }}
                  style={{ fontWeight: 600 }}
                >
                  {(() => {
                    // Show current lesson title or placeholder
                    if (currentLesson) {
                      return <span>{currentLesson.title}</span>;
                    }
                    return <span className="text-muted">Select Lesson</span>;
                  })()}
                  <ChevronDown className="w-5 h-5 text-muted ml-2" />
                </div>
                {/* Dropdown Panel */}
                <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-border rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto min-w-95" style={{ display: expandedModule ? 'block' : 'none' }}>
                  {modules && modules.map((module, mIdx) => (
                    <div key={module.id || `module-${mIdx + 1}`}
                      className="border-b border-border last:border-b-0"
                    >
                      <button
                        className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold text-main focus:outline-none text-base"
                        onClick={e => {
                          e.stopPropagation();
                          toggleModule(module.id || `module-${mIdx + 1}`);
                        }}
                      >
                        <span>{module.title || `Module ${mIdx + 1}`}</span>
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${expandedModule === (module.id || `module-${mIdx + 1}`) ? 'rotate-180' : ''}`} />
                      </button>
                      {/* Lessons List */}
                      <div className={`transition-all ${expandedModule === (module.id || `module-${mIdx + 1}`) ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
                        {module.lessons && module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`w-full text-left px-10 py-2 text-sm flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${currentLesson?.id === lesson.id ? 'bg-blue-600 text-white font-semibold' : 'text-main'}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                              setExpandedModule(null);
                            }}
                          >
                            {lesson.type === 'document' ? <FileText className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                            <span>{lesson.title}</span>
                            {currentLesson?.id === lesson.id && <Check className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Progress Bar */}
            <div className="w-full">
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
                  <div className="w-2/4 mt-0 mb-0 ml-auto mr-auto">
                    <div className="w-full bg-border rounded-full h-2 ">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted mt-2">
                      {Math.round(progressPercent)}% Complete
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-3">
              {/* AI Celebrity Button */}
              <button
                onClick={() => setIsCelebrityModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Select AI Voiceover</span>
                {selectedCelebrity && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedCelebrity.split(' ')[0]}
                  </span>
                )}
              </button>


            </div>
          </div>
        </div>

        {/* AI Celebrity Modal */}
        {isCelebrityModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              ref={modalRef}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-linear-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-main">AI Celebrity Voiceover</h2>
                    <p className="text-xs text-muted mt-0.5">Generate AI voice for this video</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCelebrityModalOpen(false)}
                  className="p-2 hover:bg-canvas-alt rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="search"
                    placeholder="Search celebrities..."
                    value={celebritySearch}
                    onChange={(e) => setCelebritySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-canvas-alt border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-main placeholder-muted"
                    autoFocus
                  />
                </div>

                {/* Celebrity List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {celebrities
                    .filter((c) =>
                      c.toLowerCase().includes(celebritySearch.trim().toLowerCase())
                    )
                    .map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          if (selectedCelebrity === c) {
                            setSelectedCelebrity(null);
                            setAiVideoUrl(null);
                          } else {
                            setSelectedCelebrity(c);
                          }
                          setIsCelebrityModalOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedCelebrity === c
                          ? "bg-blue-600 text-white"
                          : "hover:bg-canvas-alt text-main border border-border"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCelebrity === c
                            ? "bg-white/20"
                            : "bg-blue-100 dark:bg-blue-900"
                            }`}>
                            <User className={`w-4 h-4 ${selectedCelebrity === c
                              ? "text-white"
                              : "text-blue-600 dark:text-blue-400"
                              }`} />
                          </div>
                          <span className="font-medium">{c}</span>
                        </div>
                        {selectedCelebrity === c && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                </div>

                {/* Current Selection Info */}
                {selectedCelebrity && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          AI Voiceover Active
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Currently using <span className="font-semibold">{selectedCelebrity}</span>'s voice for this video
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setIsCelebrityModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-main hover:bg-canvas-alt rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsCelebrityModalOpen(false)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video and Transcript Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[calc(100vh-180px)]">
          {/* Video Section - Takes 2 columns */}
          <div className="lg:col-span-2 bg-canvas-alt p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              {/* Video Player */}
              <VideoPlayer
                currentLesson={currentLesson}
                aiVideoUrl={aiVideoUrl}
                selectedCelebrity={selectedCelebrity}
                celebrityVideoMap={celebrityVideoMap}
                activeCaption={activeCaption}
                playerContainerRef={playerContainerRef}
                videoRef={videoRef}
                handleProgress={handleProgress}
                isAIVideoLoading={isAIVideoLoading}
                isPlaying={isPlaying}
                volume={volume}
                isMuted={isMuted}
                progress={progress}
                isFullscreen={isFullscreen}
                duration={duration}
                currentTime={currentTime}
                togglePlay={togglePlay}
                handleVolumeChange={handleVolumeChange}
                toggleMute={toggleMute}
                handleSeek={handleSeek}
                toggleFullscreen={toggleFullscreen}
                formatTime={formatTime}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex <= 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all hover:shadow-md disabled:hover:shadow-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    currentLessonIndex >= allLessons.length - 1 || isNavigating
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all hover:shadow-md disabled:hover:shadow-none"
                >
                  {isNavigating ? "Loading..." : "Next"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson Content */}
              <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
                <h1 className="text-3xl font-semibold text-main mb-6 leading-tight">
                  <span className="text-blue-600">{currentLesson?.title}</span>
                </h1>
                {(generatedTextContent || currentLesson?.content?.introduction) && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted leading-relaxed">
                      {generatedTextContent || currentLesson.content.introduction}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AITranscript
            captions={captions}
            currentTime={currentTime}
            activeCaptionRef={activeCaptionRef}
            containerRef={transcriptContainerRef}
            onTranscriptClick={handleTranscriptClick}
            formatTime={formatTime}
          />
        </div>
      </div>
    </div>
  );
}