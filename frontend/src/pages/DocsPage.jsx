import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, ArrowRight, Anchor } from "lucide-react";
import { docsContent, docsStructure } from "../data/docsData";
import { MarkdownRenderer } from "../components/common/MarkdownRenderer";

const DocsPage = () => {
  const { section, page } = useParams();
  const navigate = useNavigate();
  const [activeHeading, setActiveHeading] = useState("");

  // Get active document content
  const activeSection = docsContent[section];
  const activeDoc = activeSection ? activeSection[page] : null;

  // Flatten structure to help calculate Next/Previous navigation
  const flatDocs = [];
  docsStructure.forEach(sec => {
    sec.items.forEach(item => {
      flatDocs.push({
        sectionId: sec.id,
        pageId: item.id,
        title: item.title
      });
    });
  });

  const currentIndex = flatDocs.findIndex(
    d => d.sectionId === section && d.pageId === page
  );

  const prevDoc = currentIndex > 0 ? flatDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < flatDocs.length - 1 ? flatDocs[currentIndex + 1] : null;

  // Extract H2 headings for the table of contents (Scroll Spy)
  const extractHeadings = (markdownText) => {
    if (!markdownText) return [];
    const matches = Array.from(markdownText.matchAll(/^##\s+(.*)$/gm));
    return matches.map(match => {
      const text = match[1].trim();
      const cleanText = text.replace(/`([^`]+)`/g, "$1"); // Strip inline backticks for TOC
      return {
        text: cleanText,
        id: cleanText.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      };
    });
  };

  const headings = extractHeadings(activeDoc?.content);

  // Scroll Spy logic
  useEffect(() => {
    const handleScroll = () => {
      let currentActive = "";
      // Add a threshold from the top
      const threshold = 120;

      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            currentActive = heading.id;
          }
        }
      }

      setActiveHeading(currentActive || (headings[0]?.id || ""));
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check on mount/page change
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings, section, page]);

  // Smooth scroll handler
  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeading(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  // 1. Redirection if root /docs is hit
  if (!section || !page) {
    return <Navigate to="/docs/getting-started/introduction" replace />;
  }

  // If document not found, show a clean message or redirect
  if (!activeDoc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-canvas">
        <h2 className="text-xl font-black text-main uppercase tracking-tight mb-2">Document Not Found</h2>
        <p className="text-xs text-muted mb-6">The page you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate("/docs/getting-started/introduction")}
          className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-teal-500/20"
        >
          Back to Docs Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-canvas flex justify-center py-10 px-6 lg:px-12 transition-all">
      {/* Container holding Content and Right Sidebar */}
      <div className="w-full max-w-6xl flex gap-12 relative">
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted tracking-widest mb-6">
            <span>Docs</span>
            <ChevronRight className="w-3 h-3 text-border" />
            <span>{flatDocs[currentIndex]?.sectionId.replace("-docs", "").replace("-", " ")}</span>
            <ChevronRight className="w-3 h-3 text-border" />
            <span className="text-teal-500">{activeDoc.title}</span>
          </div>

          {/* Render parsed document markdown */}
          <MarkdownRenderer content={activeDoc.content} />

          {/* Next / Previous Page Navigation Links */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-16 pt-8 border-t border-border/60">
            {prevDoc ? (
              <button
                onClick={() => navigate(`/docs/${prevDoc.sectionId}/${prevDoc.pageId}`)}
                className="flex-1 flex flex-col items-start p-5 rounded-2xl border border-border/50 bg-card hover:bg-canvas-alt hover:border-teal-500/30 transition-all text-left group cursor-pointer shadow-sm hover:shadow-md"
              >
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-muted mb-1.5 group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="w-3 h-3" /> Previous
                </span>
                <span className="text-xs font-bold text-main uppercase tracking-tight">{prevDoc.title}</span>
              </button>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}

            {nextDoc ? (
              <button
                onClick={() => navigate(`/docs/${nextDoc.sectionId}/${nextDoc.pageId}`)}
                className="flex-1 flex flex-col items-end p-5 rounded-2xl border border-border/50 bg-card hover:bg-canvas-alt hover:border-teal-500/30 transition-all text-right group cursor-pointer shadow-sm hover:shadow-md"
              >
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-muted mb-1.5 group-hover:translate-x-1 transition-transform">
                  Next <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-xs font-bold text-main uppercase tracking-tight">{nextDoc.title}</span>
              </button>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}
          </div>
        </div>

        {/* Sticky Table of Contents (Right Sidebar) */}
        {headings.length > 0 && (
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-main mb-4 border-b border-border/40 pb-2">
                <Anchor className="w-3.5 h-3.5 text-teal-500" /> On This Page
              </h4>
              <ul className="space-y-3 font-sans text-xs font-medium border-l border-border/65 pl-4">
                {headings.map((heading) => {
                  const isActive = activeHeading === heading.id;
                  return (
                    <li key={heading.id} className="relative">
                      {/* Highlight indicator line */}
                      {isActive && (
                        <div className="absolute -left-[17px] top-0 bottom-0 w-0.5 bg-teal-500 rounded-full" />
                      )}
                      <a
                        href={`#${heading.id}`}
                        onClick={(e) => handleTocClick(e, heading.id)}
                        className={`block transition-all ${
                          isActive
                            ? "text-teal-500 font-bold translate-x-1"
                            : "text-muted hover:text-main"
                        }`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DocsPage;
