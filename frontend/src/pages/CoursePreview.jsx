import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../lib/api";
import { Play, ChevronDown, ChevronUp, X, BookOpen, Clock, CheckCircle, Calendar } from "lucide-react";

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
        alert(data.message || "Failed to purchase course");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to purchase course. Please try again.");
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

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[4.5rem]">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* LEFT: details */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Mobile Hero Image (Visible only on Mobile/Tablet) */}
            <div className="lg:hidden bg-card rounded-[2.5rem] overflow-hidden border border-border/50 shadow-sm">
              <img src={heroSrc} alt="" className="w-full h-56 sm:h-72 object-cover" onError={handleHeroError} />
            </div>

            <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">Bestseller</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg">Beginner-Friendly</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">AI-Generated Content</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-main uppercase tracking-tight leading-[1.1]">{title}</h1>
                  <p className="text-sm sm:text-base text-muted font-medium leading-relaxed opacity-70">{subtitle}</p>

                  <div className="flex items-center gap-4 pt-2">
                    <img
                      src={instructorSrc}
                      alt={instructorName}
                      className="w-12 h-12 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800"
                      onError={handleInstructorError}
                    />
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-muted font-black uppercase tracking-widest opacity-50">Instructor</div>
                      <div className="text-sm font-black text-main uppercase tracking-tight">{instructorName}</div>
                    </div>
                  </div>
                </div>

                {/* stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-canvas-alt/50 p-5 rounded-3xl border border-border/30 text-center space-y-1">
                    <div className="text-amber-400 text-xs">★★★★★</div>
                    <div className="text-xl font-black text-main">{rating}</div>
                    <div className="text-[9px] text-muted font-black uppercase tracking-widest opacity-50">Rating</div>
                  </div>

                  <div className="bg-canvas-alt/50 p-5 rounded-3xl border border-border/30 text-center space-y-1">
                    <div className="text-xl font-black text-main uppercase">{students}</div>
                    <div className="text-[9px] text-muted font-black uppercase tracking-widest opacity-50">Students</div>
                  </div>

                  <div className="bg-canvas-alt/50 p-5 rounded-3xl border border-border/30 text-center space-y-1">
                    <div className="text-xl font-black text-main uppercase">{duration}</div>
                    <div className="text-[9px] text-muted font-black uppercase tracking-widest opacity-50">Duration</div>
                  </div>
                </div>

                <div className="bg-canvas-alt/30 rounded-3xl p-6 sm:p-8 border border-border/20">
                  <h3 className="text-sm sm:text-base font-black text-main uppercase tracking-widest mb-6">What you'll learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {whatYouWillLearn.map((w, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-main/80 leading-relaxed uppercase tracking-tight">
                          {typeof w === "string" ? w : (w.text || JSON.stringify(w))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-black text-main uppercase tracking-widest">Curriculum</h3>
                    <button onClick={toggleAll} className="text-[10px] font-black text-teal-500 hover:text-teal-600 uppercase tracking-widest">
                      {allExpanded ? "Collapse all" : "Expand all"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modules.length === 0 ? (
                      <div className="p-8 text-center bg-canvas-alt/50 rounded-3xl border border-dashed border-border/50 text-xs font-bold text-muted uppercase">Curriculum not available.</div>
                    ) : modules.map((mod, idx) => {
                      const id = safeGet(mod, "id", `mod-${idx}`);
                      const mt = safeGet(mod, "title", `Module ${idx + 1}`);
                      const lessons = Array.isArray(safeGet(mod, "lessons", [])) ? safeGet(mod, "lessons", []) : [];
                      const isOpen = !!openModules[id];
                      return (
                        <div key={id} className={`bg-card rounded-3xl border transition-all duration-300 ${isOpen ? 'border-teal-500/30 ring-1 ring-teal-500/10' : 'border-border/50'}`}>
                          <button onClick={() => toggleModule(id)} className="w-full flex items-center justify-between p-5 text-left" aria-expanded={isOpen}>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-black text-main uppercase tracking-tight truncate">{mt}</div>
                              <div className="text-[9px] text-muted font-bold uppercase tracking-widest opacity-50 mt-1">{lessons.length} lessons</div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-[10px] font-black text-muted uppercase tracking-tighter">
                                {lessons.reduce((acc, l) => { const m = (safeGet(l, "duration", "") || "").match(/\d+/); return acc + (m ? Number(m[0]) : 0); }, 0)}m
                              </div>
                              <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-teal-500 text-white' : 'bg-canvas-alt text-muted'}`}>
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 space-y-2 border-t border-border/20 pt-4 animate-in slide-in-from-top-2 duration-300">
                              {lessons.map((lesson) => {
                                const lid = safeGet(lesson, "id", Math.random().toString(36).slice(2, 9));
                                const ltitle = safeGet(lesson, "title", "Lesson");
                                const ltype = safeGet(lesson, "type", "");
                                const lduration = safeGet(lesson, "duration", "");
                                const ly = safeGet(lesson, "youtubeUrl", "");
                                return (
                                  <div key={lid} className="flex items-center justify-between p-3 rounded-2xl hover:bg-canvas-alt/50 transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className="w-8 h-8 shrink-0 rounded-xl bg-canvas-alt flex items-center justify-center text-muted group-hover:bg-teal-500 group-hover:text-white transition-all">
                                        {ltype === "video" ? <Play className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-black text-main uppercase tracking-tight truncate">{ltitle}</div>
                                        <div className="text-[9px] text-muted font-bold uppercase tracking-widest opacity-40">{ltype}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 ml-4">
                                      <div className="text-[10px] font-black text-muted/60 tracking-tighter">{lduration}</div>
                                      {ly && (
                                        <a href={ly} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 hover:bg-teal-500 hover:text-white transition-all shadow-sm">
                                          <Play className="w-3 h-3" />
                                        </a>
                                      )}
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

            {/* description */}
            <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border/50 shadow-sm">
              <h3 className="text-sm sm:text-base font-black text-main uppercase tracking-widest mb-4">Course Description</h3>
              <div className="text-xs sm:text-sm text-muted font-medium leading-relaxed opacity-80 uppercase tracking-tight">
                {safeGet(learningData, "course.subtitle", safeGet(courseMeta, "longDescription", safeGet(courseMeta, "description", "")))}
              </div>
            </div>
          </div>

          {/* RIGHT: sidebar with sticky pricing */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Desktop Hero Image */}
              <div className="hidden lg:block bg-card rounded-[2.5rem] overflow-hidden border border-border/50 shadow-xl group">
                <img src={heroSrc} alt="" className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" onError={handleHeroError} />
              </div>

              <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-xl space-y-8">
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-50">One-time payment</div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-4xl font-black text-main tracking-tighter uppercase">{priceDisplay === "₹0" ? "FREE" : priceDisplay}</div>
                    <div className="text-lg font-black text-muted line-through opacity-40 uppercase tracking-tighter">₹{priceOriginal}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {isPurchased ? (
                    <button onClick={() => navigate(`/learning/${courseId}`)} className="w-full py-4 rounded-2xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all">
                      Go to Course
                    </button>
                  ) : (
                    <button onClick={openEnrollModal} disabled={isPurchasing} className="w-full py-4 rounded-2xl bg-teal-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0">
                      {isPurchasing ? "Processing..." : "Enroll Now"}
                    </button>
                  )}
                  <button className="w-full py-4 rounded-2xl bg-canvas-alt text-main text-[11px] font-black uppercase tracking-widest border border-border/50 hover:bg-border/30 transition-all">
                    Share Course
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/20">
                  <div className="text-[10px] font-black text-main uppercase tracking-widest">This course includes:</div>
                  <div className="space-y-3">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <CheckCircle className="w-2.5 h-2.5 text-teal-600" />
                        </div>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-tight leading-tight">
                          {typeof f === "string" ? f : (f.text || JSON.stringify(f))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-card rounded-[2rem] p-5 border border-border/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-canvas-alt p-2 overflow-hidden border border-border/30">
                    <img
                      src={trustSrc}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={handleTrustError}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-main uppercase tracking-tight">Satisfaction Guaranteed</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-tighter opacity-60">30-day money back period</div>
                  </div>
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