import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/Header';
import DocSidebar from './DocSidebar';
import DocContent from './DocContent';
import { useScrollspy } from '../../hooks/useScrollspy';
import { Menu, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../lib/api';

const DocumentationPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [docData, setDocData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/docs`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setDocData(data);
        } else {
          console.error('Expected array of docs, got:', data);
          setDocData([]);
        }
      } catch (error) {
        console.error('Error fetching documentation data:', error);
        setDocData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocData();
  }, []);

  // Extract all section IDs for scrollspy
  const sectionIds = useMemo(() => {
    const ids = [];
    if (Array.isArray(docData)) {
      docData.forEach(category => {
        ids.push(category.id);
        if (category.sections && Array.isArray(category.sections)) {
          category.sections.forEach(section => {
            ids.push(section.id);
          });
        }
      });
    }
    return ids;
  }, [docData]);

  const activeId = useScrollspy(sectionIds, 150);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center mt-[4.5rem]">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row mt-[4.5rem]">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden sticky top-[4.5rem] z-30 bg-card/90 backdrop-blur border-b border-border/50 px-4 py-3 flex items-center">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center text-sm font-bold uppercase tracking-widest text-main/80 hover:text-main transition-colors"
          >
            <Menu className="w-5 h-5 mr-2" />
            Menu
          </button>
        </div>

        {/* Sidebar */}
        <DocSidebar 
          docData={docData} 
          activeId={activeId} 
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8 lg:py-12 relative">
          <DocContent docData={docData} />
        </main>
      </div>
    </div>
  );
};

export default DocumentationPage;
