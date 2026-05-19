import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAIVideo } from "../service/aiService";
import VideoPlayer from "../components/video/VideoPlayer";
import AITranscript from "../components/video/AITranscript";
import toast from "react-hot-toast";

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

export default function Learning() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const { user, updateUser } = useAuth();
  const [learningData, setLearningData] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [celebritySearch, setCelebritySearch] = useState("");
  const [isCelebrityModalOpen, setIsCelebrityModalOpen] = useState(false);

  // Captions state
  const [captions, setCaptions] = useState([]);
  const [activeCaption, setActiveCaption] = useState("");
  const celebrities = ["Salman Khan", "Modi ji", "SRK"];

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
  const jumpToTimeRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Auto-scroll transcript
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
      if (elementTop < containerTop || elementBottom > containerBottom) {
        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
      }
    }
  }, [currentTime]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCelebrityModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsCelebrityModalOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  // Fetch learning data
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/courses/${courseId}/learning`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const courseData = await response.json();
          setLearningData(courseData);

          const findFullLesson = (id) =>
            courseData.modules.flatMap((m) => m.lessons).find((l) => l.id === id);

          const userProgress = user?.purchasedCourses?.find(
            (course) => course.courseId === parseInt(courseId)
          )?.progress;

          let initialLesson = null;

          if (location?.state?.lessonId) {
            initialLesson = findFullLesson(location.state.lessonId);
          }
          if (!initialLesson && userProgress?.currentLesson?.lessonId) {
            initialLesson = findFullLesson(userProgress.currentLesson.lessonId);
          }
          if (!initialLesson) {
            const defaultId =
              courseData.currentLesson?.id || courseData.modules?.[0]?.lessons?.[0]?.id;
            initialLesson = findFullLesson(defaultId);
          }

          if (initialLesson) courseData.currentLesson = initialLesson;
          setLearningData(courseData);

          if (userProgress && initialLesson) {
            if (!hasRestoredProgressRef.current) {
              hasRestoredProgressRef.current = true;
              const savedData = userProgress.lessonData?.[initialLesson.id];
              if (savedData?.generatedTextContent) {
                setGeneratedTextContent(savedData.generatedTextContent);
                if (savedData.aiVideoUrl) setAiVideoUrl(savedData.aiVideoUrl);
                if (savedData.celebrity) {
                  setSelectedCelebrity(savedData.celebrity);
                  lastCelebrityRef.current = savedData.celebrity;
                }
              }
              if (savedData?.watchHistory?.currentTime) {
                jumpToTimeRef.current = savedData.watchHistory.currentTime;
              }
              setLearningData((prev) => ({ ...prev, currentLesson: initialLesson }));
            }
          }
        } else {
          setLearningData(null);
        }
      } catch (error) {
        console.log(error);
        setLearningData(null);
      }
    };
    fetchLearningData();
  }, [courseId]);

  // Reset restore flag on course change
  useEffect(() => {
    hasRestoredProgressRef.current = false;
  }, [courseId]);

  // Captions useEffect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const generateFromText = (d) => {
      if (!generatedTextContent) return false;
      const sentences = generatedTextContent.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
      if (!sentences.length) return false;
      const timePerSentence = d / sentences.length;
      setCaptions(sentences.map((text, i) => ({
        start: i * timePerSentence,
        end: (i + 1) * timePerSentence,
        text,
      })));
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
          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          if (lines.length < 2) return null;
          const match = lines[0].match(
            /(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?\.\d{3})/
          );
          if (!match) return null;
          return { start: toSeconds(match[1]), end: toSeconds(match[2]), text: lines.slice(1).join(" ") };
        }).filter(Boolean);
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

    if (generatedTextContent) {
      if (tryGenerate()) return;
      const handler = () => { generateFromText(video.duration); };
      video.addEventListener("loadedmetadata", handler, { once: true });
      return () => video.removeEventListener("loadedmetadata", handler);
    }

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

  // Load video on lesson/celebrity change
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
          ?.find((c) => c.courseId === parseInt(courseId))
          ?.progress?.lessonData?.[learningData.currentLesson.id];

        const hasSavedMatchingContent =
          savedData?.celebrity === selectedCelebrity && savedData?.generatedTextContent;

        if (hasSavedMatchingContent) {
          if (!aiVideoUrl) {
            setGeneratedTextContent(savedData.generatedTextContent);
            setAiVideoUrl(savedData.aiVideoUrl);
          }
          setIsPlaying(false);
          return;
        }

        setIsAIVideoLoading(true);
        setGeneratedTextContent("");
        setAiVideoUrl(null);

        try {
          const payload = {
            courseId: parseInt(courseId),
            lessonId: learningData.currentLesson.id,
            celebrity: selectedCelebrity.split(" ")[0].toLowerCase(), // ✅ sends "salman"
          };

          console.log("AI PAYLOAD:", payload);
          const data = await getAIVideo(payload);

          if (data?.videoUrl) {
            let isReady = data.cached || false;
            let attempts = 0;

            if (!isReady) {
              while (!isReady && attempts < 60) {
                const statusRes = await fetch(`/api/ai/status/${data.jobId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const statusData = await statusRes.json();
                if (statusData.status === "ready") {
                  isReady = true;
                  if (statusData.cloudinary_url) data.videoUrl = statusData.cloudinary_url;
                  break;
                }
                if (statusData.status === "failed") throw new Error("Video generation failed.");
                attempts++;
                await new Promise((r) => setTimeout(r, 1000));
              }
            }

            if (!isReady) throw new Error("Video generation timed out.");

            if (
              lastLessonIdRef.current !== learningData.currentLesson.id ||
              lastCelebrityRef.current !== selectedCelebrity
            ) return;

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
                console.error("Transcript error:", trErr);
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
          console.error("AI video error:", error);
          setGeneratedTextContent("");
          setAiVideoUrl(null);
          setIsPlaying(false);
        } finally {
          setIsAIVideoLoading(false);
        }
      } else {
        setIsAIVideoLoading(false);
        setGeneratedTextContent("");
        setAiVideoUrl(null);
        setIsPlaying(false);
      }
    };

    loadVideo();
  }, [learningData?.currentLesson?.id, selectedCelebrity]);

  // Fullscreen change handler
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

    const events = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
    events.forEach((event) => document.addEventListener(event, handleFullscreenChange));

    const video = videoRef.current;
    if (video) {
      video.addEventListener("webkitbeginfullscreen", () => setIsFullscreen(true));
      video.addEventListener("webkitendfullscreen", () => setIsFullscreen(false));
      const handleLoadedMetadata = () => {
        if (jumpToTimeRef.current !== null && jumpToTimeRef.current > 0) {
          const isAlmostFinished = jumpToTimeRef.current >= video.duration - 5;
          if (!isAlmostFinished) {
            video.currentTime = jumpToTimeRef.current;
            setCurrentTime(jumpToTimeRef.current);
          }
          jumpToTimeRef.current = null;
        }
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleFullscreenChange));
    };
  }, [videoRef]);

  // ─── Derived values (needed before functions) ───
  const { modules, currentLesson } = learningData || {};
  const allLessons = (modules || []).flatMap((module) => module.lessons || []);
  const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === currentLesson?.id);

  // ─── Helper functions ───
  const saveLessonData = async (lessonId, data) => {
    try {
      const token = localStorage.getItem("token");
      const mod = modules.find((m) => m.lessons?.some((l) => l.id === currentLesson.id));
      const res = await fetch("/api/users/course-progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          lessonData: { lessonId, data },
          currentLesson: {
            lessonId,
            moduleTitle: mod.title || "",
          },
          completedLesson: { lessonId },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (updateUser && result.purchasedCourses) updateUser({ purchasedCourses: result.purchasedCourses });
      }
    } catch (error) {
      console.error("Error saving lesson data:", error);
    }
  };

  const completeLesson = async (lessonId) => {
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
    else{
      toast.error("Please watch the video before continuing.");
    }
  };

  const toggleModule = (id) => setExpandedModule((prev) => (prev === id ? null : id));

  const handleLessonClick = (lesson) => {
    if (currentLesson?.id === lesson.id) return;
    setGeneratedTextContent(null);
    setAiVideoUrl(null);
    setLearningData((prev) => ({ ...prev, currentLesson: lesson }));
    const savedData = user?.purchasedCourses
      ?.find((c) => c.courseId === parseInt(courseId))
      ?.progress?.lessonData?.[lesson.id];
    jumpToTimeRef.current = savedData?.watchHistory?.currentTime || 0;
  };

  const handlePrevious = useCallback(() => {
    if (currentLessonIndex > 0) {
      handleLessonClick(allLessons[currentLessonIndex - 1]);
    }
  }, [currentLessonIndex, allLessons]);

  const handleNext = useCallback(async () => {
    if (currentLessonIndex >= allLessons.length - 1) return;
    setIsNavigating(true);
    if (currentLesson?.id) await completeLesson(currentLesson.id);
    handleLessonClick(allLessons[currentLessonIndex + 1]);
    setIsNavigating(false);
  }, [currentLessonIndex, allLessons, currentLesson]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (!selectedCelebrity && !isPlaying) {
        setIsCelebrityModalOpen(true);
        return;
      }
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const p = videoRef.current.play();
        if (p && typeof p.then === "function") {
          p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(true);
        }
      }
    }
  }, [isPlaying, selectedCelebrity]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;
    const isFull = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    if (!isFull) {
      const req = container.requestFullscreen || container.webkitRequestFullscreen ||
        container.mozRequestFullScreen || container.msRequestFullscreen;
      if (req) req.call(container).catch(console.error);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen ||
        document.mozCancelFullScreen || document.msExitFullscreen;
      if (exit) exit.call(document);
    }
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      const vidCurrentTime = videoRef.current.currentTime;
      if (isFinite(vidDuration) && vidDuration > 0) setDuration(vidDuration);
      setCurrentTime(vidCurrentTime);
      const currentProgressPercent = vidDuration > 0 ? (vidCurrentTime / vidDuration) * 100 : 0;
      setProgress(currentProgressPercent);

      if (Math.abs(vidCurrentTime - lastSavedTimeRef.current) >= 5) {
        lastSavedTimeRef.current = vidCurrentTime;
        if (learningData?.currentLesson && isFinite(vidDuration) && vidDuration > 0 && !isNaN(currentProgressPercent)) {
          const formatDurationString = (secs) => {
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s < 10 ? "0" : ""}${s}`;
          };
          const safeProgress = Math.max(0, Math.min(100, currentProgressPercent));
          saveLessonData(learningData.currentLesson.id, {
            watchHistory: {
              currentTime: vidCurrentTime,
              duration: vidDuration,
              progressPercent: safeProgress,
              lastWatched: new Date().toISOString(),
              title: learningData.currentLesson.title || "Lesson Video",
              thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
              formattedDuration: formatDurationString(vidDuration),
              status: safeProgress >= 95 ? "completed" : "in-progress",
            },
          });
        }
      }

      if (captions.length > 0) {
        const cue = captions.find((c) => vidCurrentTime >= c.start && vidCurrentTime <= c.end);
        const targetText = cue ? cue.text : "";
        if (activeCaption !== targetText) setActiveCaption(targetText);
      }
    }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const vidDuration = v.duration;
    if (!isFinite(vidDuration) || vidDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percentage * vidDuration;
    v.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const handleTranscriptClick = (startTime) => {
    const v = videoRef.current;
    if (!v) return;
    const vidDuration = v.duration;
    v.currentTime = startTime;
    setCurrentTime(startTime);
    if (isFinite(vidDuration) && vidDuration > 0) setProgress((startTime / vidDuration) * 100);
    if (!isPlaying) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch(console.warn);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (time) => {
    if (time === undefined || time === null || Object.is(time, NaN) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(Math.abs(time) / 60);
    const seconds = Math.floor(Math.abs(time) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ── Keyboard shortcuts — AFTER all functions are defined ──
  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (isCelebrityModalOpen) return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;
        case "n":
          event.preventDefault();
          if (currentLessonIndex < allLessons.length - 1) handleNext();
          break;
        case "p":
          event.preventDefault();
          if (currentLessonIndex > 0) handlePrevious();
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "arrowright":
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.currentTime + 10,
              videoRef.current.duration || 0
            );
          }
          break;
        case "arrowleft":
          event.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
          }
          break;
        case "arrowup":
          event.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(volume + 0.1, 1);
            setVolume(newVol);
            videoRef.current.volume = newVol;
          }
          break;
        case "arrowdown":
          event.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(volume - 0.1, 0);
            setVolume(newVol);
            videoRef.current.volume = newVol;
          }
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isCelebrityModalOpen,
    togglePlay,
    handleNext,
    handlePrevious,
    toggleMute,
    toggleFullscreen,
    currentLessonIndex,
    allLessons,
    volume,
  ]);

  // Loading state
  if (!learningData) {
    return (
      <div className="min-h-screen bg-canvas-alt flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-muted">{t("learning.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border px-6 py-3 grid grid-flow-col-dense">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted mt-2">
          <button onClick={() => navigate("/")} className="hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-muted" />
          <button onClick={() => navigate("/courses")} className="hover:text-blue-600 transition-colors">
            {t("learning.my_course")}
          </button>
          <ChevronRight className="w-4 h-4 text-muted" />
          <button className="hover:text-blue-600 transition-colors" disabled style={{ cursor: "default", opacity: 1, fontWeight: 600 }}>
            {(() => {
              if (modules && currentLesson) {
                const mod = modules.find((m) => m.lessons?.some((l) => l.id === currentLesson.id));
                return mod?.title || "Module";
              }
              return "Module";
            })()}
          </button>
          <ChevronRight className="w-4 h-4 text-muted" />
          <span className="text-main font-medium">{currentLesson?.title}</span>
        </div>
      </div>

      {/* Content Selector */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md flex items-center">
            <span className="text-main font-semibold mr-3">{t("learning.contents")}</span>
            <div className="relative w-full">
              <div
                className="bg-canvas-alt border border-border rounded-2xl px-6 py-2 pr-12 text-base text-main cursor-pointer flex items-center justify-between select-none min-h-12"
                tabIndex={0}
                onClick={() => {
                  if (expandedModule) {
                    setExpandedModule(null);
                  } else {
                    if (modules && currentLesson) {
                      const mod = modules.find((m) => m.lessons?.some((l) => l.id === currentLesson.id));
                      setExpandedModule(mod?.id || null);
                    } else {
                      setExpandedModule(null);
                    }
                  }
                }}
                style={{ fontWeight: 600 }}
              >
                {currentLesson ? <span>{currentLesson.title}</span> : <span className="text-muted">Select Lesson</span>}
                <ChevronDown className="w-5 h-5 text-muted ml-2" />
              </div>
              <div
                className="absolute left-0 mt-2 w-full sm:w-[400px] bg-white dark:bg-gray-900 border border-border rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
                style={{ display: expandedModule ? "block" : "none" }}
              >
                {modules && modules.map((module, mIdx) => (
                  <div key={module.id || `module-${mIdx + 1}`} className="border-b border-border last:border-b-0">
                    <button
                      className="w-full flex items-center justify-between px-5 py-2 text-left hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold text-main focus:outline-none text-base"
                      onClick={(e) => { e.stopPropagation(); toggleModule(module.id || `module-${mIdx + 1}`); }}
                    >
                      <span>{module.title || `Module ${mIdx + 1}`}</span>
                      <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${expandedModule === (module.id || `module-${mIdx + 1}`) ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`transition-all ${expandedModule === (module.id || `module-${mIdx + 1}`) ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
                      {module.lessons && module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`w-full text-left px-10 py-2 text-sm flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${currentLesson?.id === lesson.id ? "bg-blue-600 text-white font-semibold" : "text-main"}`}
                          onClick={(e) => { e.stopPropagation(); handleLessonClick(lesson); setExpandedModule(null); }}
                        >
                          {lesson.type === "document" ? <FileText className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
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

          {/* Progress Bar */}
          <div className="w-full">
            {(() => {
              const completedCount = user?.purchasedCourses?.find(
                (course) => course.courseId === parseInt(courseId)
              )?.progress?.completedLessons?.length || 0;
              const totalCount = allLessons.length;
              const progressPercent = Math.min((completedCount / totalCount) * 100, 100);
              return (
                <div className="w-full sm:w-1/2 mx-auto">
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-sm text-muted mt-2">{Math.round(progressPercent)}% {t("learning.complete")}</p>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center justify-end sm:justify-start w-full">
            <button
              onClick={() => setIsCelebrityModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t("learning.select_ai_voiceover")}</span>
              {selectedCelebrity && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {selectedCelebrity.split(" ")[0]}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Celebrity Modal */}
      {isCelebrityModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-linear-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-main">{t("learning.ai_celebrity_title")}</h2>
                  <p className="text-xs text-muted mt-0.5">{t("learning.ai_celebrity_subtitle")}</p>
                </div>
              </div>
              <button onClick={() => setIsCelebrityModalOpen(false)} className="p-2 hover:bg-canvas-alt rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="search"
                  placeholder={t("learning.search_celebrities")}
                  value={celebritySearch}
                  onChange={(e) => setCelebritySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-canvas-alt border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-main placeholder-muted"
                  autoFocus
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {celebrities
                  .filter((c) => c.toLowerCase().includes(celebritySearch.trim().toLowerCase()))
                  .map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        if (selectedCelebrity === c) { setSelectedCelebrity(null); setAiVideoUrl(null); }
                        else setSelectedCelebrity(c);
                        setIsCelebrityModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedCelebrity === c ? "bg-blue-600 text-white" : "hover:bg-canvas-alt text-main border border-border"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCelebrity === c ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900"}`}>
                          <User className={`w-4 h-4 ${selectedCelebrity === c ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                        </div>
                        <span className="font-medium">{c}</span>
                      </div>
                      {selectedCelebrity === c && <Check className="w-4 h-4" />}
                    </button>
                  ))}
              </div>
              {selectedCelebrity && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t("learning.ai_voiceover_active")}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {t("learning.ai_celebrity_subtitle")} — <span className="font-semibold">{selectedCelebrity}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setIsCelebrityModalOpen(false)} className="px-4 py-2 text-sm text-muted hover:text-main hover:bg-canvas-alt rounded-lg transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={() => setIsCelebrityModalOpen(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video and Transcript Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[calc(100vh-180px)]">
        <div className="lg:col-span-2 bg-canvas-alt p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
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

            {/* ── Keyboard Shortcuts Hint ── */}
            <div className="flex flex-wrap gap-2 my-3 text-xs text-muted">
              {[
                { key: "Space / K", label: "Play/Pause" },
                { key: "N", label: "Next" },
                { key: "P", label: "Previous" },
                { key: "M", label: "Mute" },
                { key: "F", label: "Fullscreen" },
                { key: "← →", label: "±10s" },
                { key: "↑ ↓", label: "Volume" },
              ].map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-canvas border border-border rounded text-[10px] font-mono font-bold">
                    {key}
                  </kbd>
                  <span>{label}</span>
                </span>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePrevious}
                disabled={currentLessonIndex <= 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
                {t("learning.previous")}
              </button>
              <button
                onClick={handleNext}
                disabled={currentLessonIndex >= allLessons.length - 1 || isNavigating}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                {isNavigating ? t("learning.loading") : t("learning.next")}
                <ChevronRight className="w-5 h-5" />
              </button>
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
    </>
  );
}