import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../lib/api";
import { Play, ChevronDown, ChevronUp, X } from "lucide-react";
import toast from "react-hot-toast";

/* safe getter */
function safeGet(obj, path, fallback = undefined) {
  if (!obj || !path) return fallback;
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj) ?? fallback;
}

/* build candidate URLs for an image path */
function buildImageCandidates(imagePath) {
  const placeholder = "/ui/course-hero-placeholder.jpg";
  if (!imagePath) return [placeholder];

  const p = String(imagePath).trim();
  if (!p) return [placeholder];

  const candidates = [];

  // if absolute http(s) or protocol-relative
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("//")) {
    candidates.push(p);
  } else {
    // try raw as-is (sometimes it is already correct relative to app root)
    candidates.push(p);
    // try prefixed by slash
    candidates.push("/" + p);
    // try prefixing API base
    candidates.push(`${API_BASE_URL}/${p}`);
    // try common uploads folder
    candidates.push(`${API_BASE_URL}/uploads/${p}`);
  }

  // finally fallback placeholder
  candidates.push(placeholder);
  return candidates;
}

export default function CoursePreview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [courseMeta, setCourseMeta] = useState(null);
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const purchaseLock = useRef(false);

  // module collapse
  const [openModules, setOpenModules] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  // modal for enrollment
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // hero image src handling
  const [heroSrc, setHeroSrc] = useState("/ui/course-hero-placeholder.jpg");
  const heroCandidatesRef = useRef([]);
  const heroIndexRef = useRef(0);

  // instructor image candidates + state (brand-first)
  const [instructorSrc, setInstructorSrc] = useState("/ui/avatar-4.png");
  const instructorCandidatesRef = useRef([]);
  const instructorIndexRef = useRef(0);

  // trust badge candidates + state (brand-first)
  const [trustSrc, setTrustSrc] = useState("/ui/trust-badge.png");
  const trustCandidatesRef = useRef([]);
  const trustIndexRef = useRef(0);

  // fetch meta & learning
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metaRes, learnRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/courses/${courseId}/learning`),
        ]);

        if (!metaRes.ok) throw new Error("Failed to fetch course meta");
        if (!learnRes.ok) throw new Error("Failed to fetch course learning");

        const meta = await metaRes.json();
        const learning = await learnRes.json();

        if (!cancelled) {
          setCourseMeta(meta || {});
          setLearningData(learning || {});

          // init module open state
          const mods = Array.isArray(learning?.modules) ? learning.modules : Array.isArray(meta?.modules) ? meta.modules : [];
          const init = mods.reduce((acc, m, i) => {
            acc[m.id ?? `mod-${i}`] = i === 0;
            return acc;
          }, {});
          setOpenModules(init);

          // prepare hero image candidates & initial src
          const heroPath = safeGet(meta, "image", safeGet(learning, "course.logo", ""));
          const heroCandidates = buildImageCandidates(heroPath);
          heroCandidatesRef.current = heroCandidates;
          heroIndexRef.current = 0;
          setHeroSrc(heroCandidates[0] || "/ui/course-hero-placeholder.jpg");

          // prepare instructor image candidates: brand-first then backend candidates
          const brandInstructorPaths = ["/AI_Tutor_New_UI/Course_Preview/Mascot.jpeg", "/brankkit/mascot.png", "/assets/mascot.png"];
          const backendInstructorCandidates = buildImageCandidates(safeGet(meta, "instructorPhoto", ""));
          instructorCandidatesRef.current = [...brandInstructorPaths, ...backendInstructorCandidates, "/ui/avatar-4.png"];
          instructorIndexRef.current = 0;
          setInstructorSrc(instructorCandidatesRef.current[0] || "/ui/avatar-4.png");

          // prepare trust badge candidates (brand-first)
          const brandTrustPaths = ["/AI_Tutor_New_UI/Course_Preview/US.png", "/brankkit/US.png", "/assets/US.png"];
          trustCandidatesRef.current = [...brandTrustPaths, "/ui/trust-badge.png"];
          trustIndexRef.current = 0;
          setTrustSrc(trustCandidatesRef.current[0] || "/ui/trust-badge.png");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load course details. Try reloading.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // redirect if purchased (keeps behaviour of redirecting to /courses)
  useEffect(() => {
    if (!user || !courseId) return;
    const purchased = Array.isArray(user.purchasedCourses) && user.purchasedCourses.some((c) => Number(c.courseId) === Number(courseId));
    if (purchased) navigate(`/courses`, { replace: true });
  }, [user, courseId, navigate]);

  // image error handlers: cycle through candidates
  const handleHeroError = () => {
    const candidates = heroCandidatesRef.current || [];
    const nextIndex = heroIndexRef.current + 1;
    if (nextIndex < candidates.length) {
      heroIndexRef.current = nextIndex;
      setHeroSrc(candidates[nextIndex]);
    }
  };

  const handleInstructorError = (ev) => {
    const candidates = instructorCandidatesRef.current || [];
    const nextIndex = instructorIndexRef.current + 1;
    if (nextIndex < candidates.length) {
      instructorIndexRef.current = nextIndex;
      // update the <img> directly so React doesn't fight with onError loop
      ev.currentTarget.src = candidates[nextIndex];
      setInstructorSrc(candidates[nextIndex]);
    }
  };

  const handleTrustError = (ev) => {
    const candidates = trustCandidatesRef.current || [];
    const nextIndex = trustIndexRef.current + 1;
    if (nextIndex < candidates.length) {
      trustIndexRef.current = nextIndex;
      ev.currentTarget.src = candidates[nextIndex];
      setTrustSrc(candidates[nextIndex]);
    }
  };

  // toggle single module
  const toggleModule = (id) => {
    setOpenModules((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      setAllExpanded(Object.keys(next).length > 0 && Object.keys(next).every((k) => next[k]));
      return next;
    });
  };

  const toggleAll = () => {
    setOpenModules((prev) => {
      const keys = Object.keys(prev);
      const next = keys.reduce((acc, k) => ((acc[k] = !allExpanded), acc), {});
      setAllExpanded(!allExpanded);
      return next;
    });
  };

  // open modal for enrollment
  const openEnrollModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const title = safeGet(courseMeta, "title", safeGet(learningData, "course.title", "Course"));
    const img = heroSrc;
    const category = safeGet(courseMeta, "category", "");
    const level = safeGet(courseMeta, "level", "");
    const price = safeGet(courseMeta, "price", safeGet(courseMeta, "priceValue", null) ? `₹${safeGet(courseMeta, "priceValue")}` : "₹0");

    setSelectedCourse({
      id: Number(courseId),
      title,
      image: img,
      category,
      level,
      price,
    });
    setShowEnrollPopup(true);
  };

  // confirm enrollment from modal -> purchase and redirect to /courses
  const confirmEnroll = async () => {
    if (!selectedCourse) return;

    if (purchaseLock.current) return;
    purchaseLock.current = true;
    setIsPurchasing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/purchase-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: Number(selectedCourse.id),
          courseTitle: selectedCourse.title,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (updateUser) {
          updateUser({
            ...user,
            purchasedCourses: data.purchasedCourses,
          });
        }

        // close modal and redirect to Courses page (My Courses)
        setShowEnrollPopup(false);
        setSelectedCourse(null);
        navigate("/courses", { replace: true });
      } else {
        toast.error(data.message || "Failed to purchase course");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("Failed to purchase course. Please try again.");
    } finally {
      setIsPurchasing(false);
      purchaseLock.current = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || (!courseMeta && !learningData)) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">{error || "Course not found"}</h2>
          <p className="text-gray-600">Please check the course ID or try again later.</p>
        </div>
      </div>
    );
  }

  // derive fields safely
  const title = safeGet(courseMeta, "title", safeGet(learningData, "course.title", "Course Title"));
  const subtitle = safeGet(learningData, "course.subtitle", safeGet(courseMeta, "subtitle", ""));
  const instructorName = safeGet(courseMeta, "instructor", "Instructor");
  const rating = safeGet(courseMeta, "rating", 4.8);
  const students = safeGet(courseMeta, "students", `${safeGet(courseMeta, "studentsCount", 0)} students`);
  const duration = safeGet(courseMeta, "duration", safeGet(courseMeta, "totalDuration", "15.5h"));

  const priceDisplay = safeGet(courseMeta, "price", safeGet(courseMeta, "priceValue", null) ? `₹${safeGet(courseMeta, "priceValue")}` : "₹0");
  const priceOriginal = safeGet(courseMeta, "priceOriginal", safeGet(courseMeta, "price", "7000"));

  const whatYouWillLearn = Array.isArray(safeGet(courseMeta, "whatYouWillLearn", null))
    ? safeGet(courseMeta, "whatYouWillLearn", [])
    : Array.isArray(safeGet(learningData, "course.keyTakeaways", null))
      ? safeGet(learningData, "course.keyTakeaways", [])
      : ["Understand core concepts and practical workflows", "Build real-world projects and examples", "Apply industry tools and best practices"];

  const modules = Array.isArray(safeGet(learningData, "modules", null))
    ? safeGet(learningData, "modules", [])
    : Array.isArray(safeGet(courseMeta, "modules", null))
      ? safeGet(courseMeta, "modules", [])
      : [];

  const features = Array.isArray(safeGet(courseMeta, "features", null))
    ? safeGet(courseMeta, "features", [])
    : [{ text: "Lifetime access" }, { text: "Access on mobile and desktop" }, { text: "Certificate of completion" }];

  const isPurchased = Array.isArray(user?.purchasedCourses) && user.purchasedCourses.some((c) => Number(c.courseId) === Number(courseId));

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <Header />

      <main className="max-w-[1280px] mx-auto px-4 py-8 lg:py-16 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: details */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-sm font-medium text-[#FACC15]">Bestseller</span>
                    <span className="text-sm font-medium bg-[#22C55E] text-white px-3 py-1 rounded-full">Beginner-Friendly</span>
                    <span className="text-sm font-medium bg-[#3B82F6] text-white px-3 py-1 rounded-full">AI-Generated Content</span>
                  </div>

                  <h1 className="text-2xl lg:text-4xl font-bold text-[#0D0D0D] leading-tight">{title}</h1>
                  <p className="text-gray-600 mt-2">{subtitle}</p>

                  <div className="flex items-center gap-3 mt-4">
                    {/* instructor image: brand-first + backend fallback; maintain proportions */}
                    <img
                      src={instructorSrc}
                      alt={instructorName}
                      className="w-12 h-12 rounded-full object-contain"
                      onError={handleInstructorError}
                    />
                    <div className="text-sm text-[#6B7280]">
                      Created by <span className="text-[#FF6C34] font-medium">{instructorName}</span>
                      <div className="text-xs text-gray-400">Last updated {safeGet(courseMeta, "updatedAt", "—") ? new Date(safeGet(courseMeta, "updatedAt", Date.now())).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>
                </div>

                {/* stats + what you'll learn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-[#FBFBFF] p-4 rounded-lg text-center shadow-sm">
                    <div className="text-yellow-400">★★★★★</div>
                    <div className="text-xl font-semibold">{rating}</div>
                    <div className="text-xs text-gray-400">12,847 reviews</div>
                  </div>

                  <div className="bg-[#FBFBFF] p-4 rounded-lg text-center shadow-sm">
                    <div className="text-purple-400 font-semibold text-xl">{students}</div>
                    <div className="text-xs text-gray-400">Students enrolled</div>
                  </div>

                  <div className="bg-[#FBFBFF] p-4 rounded-lg text-center shadow-sm">
                    <div className="text-sky-400 font-semibold text-xl">{duration}</div>
                    <div className="text-xs text-gray-400">Total content</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#F3F4F6] mt-6 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
                  <h3 className="text-lg font-semibold mb-4">What you'll learn</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#374151]">
                    {whatYouWillLearn.map((w, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div>{typeof w === "string" ? w : (w.text || JSON.stringify(w))}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Curriculum</h3>
                    <button onClick={toggleAll} className="text-sm text-[#374151] bg-white border border-border px-3 py-1 rounded-lg hover:bg-gray-50">
                      {allExpanded ? "Collapse all" : "Expand all"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modules.length === 0 ? (
                      <div className="text-sm text-gray-500">Curriculum details not available.</div>
                    ) : modules.map((mod, idx) => {
                      const id = safeGet(mod, "id", `mod-${idx}`);
                      const mt = safeGet(mod, "title", `Module ${idx + 1}`);
                      const lessons = Array.isArray(safeGet(mod, "lessons", [])) ? safeGet(mod, "lessons", []) : [];
                      const isOpen = !!openModules[id];
                      return (
                        <div key={id} className="bg-white rounded-md border border-[#F3F4F6] p-4">
                          <button onClick={() => toggleModule(id)} className="w-full flex items-center justify-between text-left" aria-expanded={isOpen}>
                            <div>
                              <div className="text-sm font-medium">{mt}</div>
                              <div className="text-xs text-gray-400">{lessons.length} lessons</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs text-gray-500">{lessons.reduce((acc, l) => { const m = (safeGet(l, "duration", "") || "").match(/\d+/); return acc + (m ? Number(m[0]) : 0); }, 0) > 0 ? `${lessons.reduce((acc, l) => { const m = (safeGet(l, "duration", "") || "").match(/\d+/); return acc + (m ? Number(m[0]) : 0); }, 0)}m` : ""}</div>
                              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="mt-3 space-y-2">
                              {lessons.map((lesson) => {
                                const lid = safeGet(lesson, "id", Math.random().toString(36).slice(2, 9));
                                const ltitle = safeGet(lesson, "title", "Lesson");
                                const ltype = safeGet(lesson, "type", "");
                                const lduration = safeGet(lesson, "duration", "");
                                const ly = safeGet(lesson, "youtubeUrl", "");
                                return (
                                  <div key={lid} className="flex items-center justify-between p-2 rounded-md hover:bg-canvas-alt">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-md bg-[#F8FAFC] flex items-center justify-center">
                                        {ltype === "video" ? <Play className="w-4 h-4" /> : <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" fill="#6B7280" /></svg>}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">{ltitle}</div>
                                        <div className="text-xs text-gray-400">{ltype}{ly ? " • video" : ""}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-xs text-gray-500">{lduration}</div>
                                      {ly && <a href={ly} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-medium flex items-center gap-1"><Play className="w-3 h-3" /> Play</a>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* long description */}
            <div className="mt-6 bg-white rounded-xl p-6 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
              <h3 className="text-lg font-semibold mb-3">Course description</h3>
              <div className="text-gray-600 text-sm leading-relaxed">
                {safeGet(learningData, "course.subtitle", safeGet(courseMeta, "longDescription", safeGet(courseMeta, "description", "Full course description pulled from backend.")))}
              </div>
            </div>
          </div>

          {/* RIGHT: image (top) then Buy Now (below) */}
          <div className="lg:col-span-4 flex flex-col items-stretch">
            <div className="bg-white rounded-xl overflow-hidden shadow-md mb-6">
              <img src={heroSrc} alt={title} className="w-full h-56 object-cover" onError={handleHeroError} />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 mb-1">Lifetime access</div>
                <div className="text-3xl font-extrabold text-[#0D0D0D] mb-2">{priceDisplay}</div>
                <div className="text-sm text-gray-400 line-through">₹{priceOriginal}</div>
              </div>

              {safeGet(courseMeta, "countdown", null) ? (
                <div className="bg-[#FFF7ED] text-[#B45309] text-center p-3 rounded-md mb-4">
                  Sale ends in: {safeGet(courseMeta, "countdown.hours", 0)}h {safeGet(courseMeta, "countdown.minutes", 0)}m {safeGet(courseMeta, "countdown.seconds", 0)}s
                </div>
              ) : null}

              {isPurchased ? (
                <button onClick={() => navigate(`/learning/${courseId}`)} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg mb-3 hover:opacity-95">
                  Go to Course
                </button>
              ) : (
                <button onClick={openEnrollModal} disabled={isPurchasing} className="w-full bg-gradient-to-r from-[#00BEA5] to-[#54D3C3] text-white font-semibold py-3 rounded-lg mb-3 hover:opacity-95 disabled:opacity-50">
                  {isPurchasing ? "Processing..." : "Buy Now"}
                </button>
              )}

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-1" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div>{typeof f === "string" ? f : (f.text || JSON.stringify(f))}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* trust card (uses US brand image first) */}
            <div className="bg-white rounded-xl p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)] text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <img
                  src={trustSrc}
                  alt="trust"
                  className="w-10 h-10 object-contain"
                  onError={handleTrustError}
                />
                <div>
                  <div className="font-medium text-gray-800">30-day refund</div>
                  <div className="text-xs text-gray-400">No questions asked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ENROLL CONFIRM POPUP (same style as CoursesPage) */}
      {showEnrollPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button onClick={() => setShowEnrollPopup(false)} className="absolute top-4 right-4">
              <X />
            </button>

            <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-40 object-cover rounded-xl mb-4" />

            <h2 className="text-xl font-bold">{selectedCourse.title}</h2>

            <p className="text-sm text-slate-500 mt-1">
              {selectedCourse.category} • {selectedCourse.level}
            </p>

            <div className="flex justify-between items-center mt-4">
              <span className="line-through text-slate-400">{selectedCourse.price}</span>
              <span className="text-lg font-bold text-green-600">₹0</span>
            </div>

            <button onClick={confirmEnroll} className="w-full mt-6 py-3 rounded-xl bg-[#2DD4BF] text-white font-semibold">
              {isPurchasing ? "Processing..." : "Confirm Enrollment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}