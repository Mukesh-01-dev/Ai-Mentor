import React from 'react';

const DocSidebar = ({ docData, activeId, isMobileOpen, setIsMobileOpen }) => {
  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Close mobile sidebar after click
      if (setIsMobileOpen) setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-0 lg:top-18.5 left-0 z-50 w-72 h-[100dvh] lg:h-[calc(100vh-4.5rem)] bg-card border-r border-border/50 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full overflow-y-auto px-6 py-8 scrollbar-hide">
          <div className="mb-8 lg:hidden">
            <h1 className="text-xl font-black text-main tracking-tight uppercase">Documentation</h1>
          </div>
          
          <nav className="space-y-8">
            {docData.map((category) => (
              <div key={category.id}>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">
                  {category.title}
                </h3>
                <ul className="space-y-1.5 border-l border-border/60 ml-2">
                  {category.sections.map((section) => {
                    const isActive = activeId === section.id || activeId === category.id;
                    return (
                      <li key={section.id}>
                        <a 
                          href={`#${section.id}`} 
                          onClick={(e) => handleClick(e, section.id)}
                          className={`block pl-4 py-1.5 text-sm font-medium transition-all ${
                            isActive 
                              ? 'text-teal-500 border-l-2 border-teal-500 -ml-[1px]' 
                              : 'text-main/70 hover:text-main hover:border-l-2 hover:border-border/80 hover:-ml-[1px]'
                          }`}
                        >
                          {section.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default DocSidebar;
