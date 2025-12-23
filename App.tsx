import React, { useState, useEffect, Suspense, useMemo } from 'react';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import Avatar3D from './components/Avatar3D';
import InteractiveCV from './components/InteractiveCV';
import EditableText from './components/EditableText';
import { Project } from './types';
import { GithubIcon, ExternalLinkIcon, MenuIcon, SparklesIcon, YoutubeIcon, MediumIcon } from './components/Icons';
import { ContentProvider, useContent } from './contexts/ContentContext';

// Admin Lock Icon Component
const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const AppContent: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState('about');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Admin Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const { projects, isEditMode, login, logout, saveChanges, resetContent, downloadSourceCode } = useContent();

  // Dynamic Categories based on current projects
  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    // Scroll Spy Logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-20% 0px -50% 0px'
      }
    );

    const sections = ['about', 'work', 'trajectory', 'contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setMobileMenuOpen(false);
    }
  };

  const handleAdminClick = () => {
    if (isEditMode) {
      logout();
    } else {
      setShowLoginModal(true);
      setLoginError(false);
      setAdminPassword('');
    }
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(adminPassword);
    if (success) {
      setShowLoginModal(false);
      setAdminPassword('');
    } else {
      setLoginError(true);
    }
  };

  const NavLink = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => scrollToSection(id)}
      className={`text-sm font-medium transition-colors relative group ${
        activeSection === id ? 'text-white' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {label}
      {activeSection === id && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full animate-fade-in" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${scrolled ? 'bg-zinc-950/80 backdrop-blur-lg border-zinc-800 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => scrollToSection('about')} className="text-xl font-bold tracking-tighter flex items-center gap-2 z-50 hover:opacity-80 transition-opacity text-left">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-black shrink-0">M</div>
            <span className="hidden sm:inline">Mehmet Eren Ozyoldash</span>
            <span className="sm:hidden">M. Eren Ozyoldash</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink id="about" label="About" />
            <NavLink id="work" label="Work" />
            <NavLink id="trajectory" label="Trajectory" />
            <NavLink id="contact" label="Contact" />
            
            <div className="flex items-center gap-2 ml-4">
              <a 
                href="https://github.com/mehmeterenozyoldas-maker" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.youtube.com/@Techne89" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
              >
                <YoutubeIcon className="w-4 h-4" />
                <span>YouTube</span>
              </a>
              <a 
                href="https://mehmeterenozyoldas.medium.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
              >
                <MediumIcon className="w-4 h-4" />
                <span>Medium</span>
              </a>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-white z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-zinc-950 pt-24 px-6 lg:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-2xl font-bold">
            <button className="text-left hover:text-indigo-400 transition-colors" onClick={() => scrollToSection('about')}>About</button>
            <button className="text-left hover:text-indigo-400 transition-colors" onClick={() => scrollToSection('work')}>Work</button>
            <button className="text-left hover:text-indigo-400 transition-colors" onClick={() => scrollToSection('trajectory')}>Trajectory</button>
            <button className="text-left hover:text-indigo-400 transition-colors" onClick={() => scrollToSection('contact')}>Contact</button>
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-zinc-800">
              <a href="https://github.com/mehmeterenozyoldas-maker" className="flex items-center gap-2 text-lg font-medium text-zinc-400 hover:text-white">
                <GithubIcon className="w-5 h-5" /> GitHub
              </a>
              <a href="https://www.youtube.com/@Techne89" className="flex items-center gap-2 text-lg font-medium text-zinc-400 hover:text-white">
                <YoutubeIcon className="w-5 h-5" /> YouTube
              </a>
              <a href="https://mehmeterenozyoldas.medium.com/" className="flex items-center gap-2 text-lg font-medium text-zinc-400 hover:text-white">
                <MediumIcon className="w-5 h-5" /> Medium
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="about" className="relative pt-32 pb-10 md:pt-40 md:pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Column: Text */}
          <div className="max-w-2xl order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-mono text-zinc-400">Based in Sweden | Originally from Cyprus</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              <EditableText id="hero_title_1" /><br />
              <EditableText id="hero_title_2" /><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                <EditableText id="hero_title_3" />
              </span>
            </h1>
            
            <div className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
              <EditableText id="hero_bio" multiline />
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => scrollToSection('work')}
                className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors"
              >
                View Work
              </button>
            </div>
          </div>

          {/* Right Column: 3D Avatar */}
          <div className="order-1 md:order-2 h-[400px] md:h-[600px] w-full relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] -z-10" />
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-500">Loading Digital Twin...</div>}>
              <Avatar3D />
            </Suspense>
            <div className="absolute bottom-10 right-10 md:right-0 text-right pointer-events-none">
               <p className="text-xs font-mono text-zinc-500">INTERACTIVE AVATAR</p>
               <p className="text-xs font-mono text-zinc-600">DRAG TO ROTATE • CLICK GAMEBOY TO PLAY</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block cursor-pointer" onClick={() => scrollToSection('work')}>
           <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex justify-center p-1 hover:border-indigo-400 transition-colors">
             <div className="w-1 h-2 bg-zinc-500 rounded-full" />
           </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="work" className="py-20 px-6 bg-zinc-950 min-h-[800px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Selected Work</h2>
              <p className="text-zinc-400">200+ vibe coded creative experiences and products, interactive installations, creative design tools, speculative mini projects, and games for kids. Showing <span className="text-white font-bold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'project' : 'projects'}.</p>
            </div>
            
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all duration-300 ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <div 
                key={`${project.id}-${selectedCategory}`} 
                className={`animate-fade-in-up ${project.featured ? 'md:col-span-2 md:row-span-2' : ''}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ProjectCard 
                  project={project} 
                  onClick={() => setSelectedProject(project)}
                />
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-3xl">
                No projects found in this category.
              </div>
            )}
          </div>
        </div>
      </section>

       {/* Interactive CV Terminal */}
       <section id="trajectory" className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Data Deck</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore my trajectory through this interactive terminal. 
              Enable the camera to navigate using hand gestures (Minority Report style), or simply click through.
            </p>
          </div>
          
          <InteractiveCV />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter"><EditableText id="contact_headline" /></h2>
          <p className="text-xl text-zinc-400 mb-12">
            <EditableText id="contact_sub" />
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="mailto:mehmeterenozyoldas@gmail.com" className="inline-flex items-center gap-3 text-xl font-bold bg-white text-black px-8 py-4 rounded-full hover:bg-zinc-200 transition-all">
              Email Me <ExternalLinkIcon className="w-5 h-5" />
            </a>
            <a href="https://se.linkedin.com/in/m-e-ozyoldash" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xl font-bold border border-zinc-700 text-white px-8 py-4 rounded-full hover:bg-zinc-800 transition-all">
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            © 2024 Mehmet Eren Ozyoldash. Built with precision and care.
          </p>
          <div className="flex gap-6">
             <a href="https://mehmeterenozyoldas.medium.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">Medium</a>
             <a href="https://se.linkedin.com/in/m-e-ozyoldash" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">LinkedIn</a>
             <a href="https://github.com/mehmeterenozyoldas-maker" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">GitHub</a>
             <a href="https://www.youtube.com/@Techne89" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
        
        {/* Admin Trigger (Fixed Positioning & Z-Index) */}
        <div className="fixed bottom-4 left-4 z-50">
          <button 
             onClick={handleAdminClick} 
             className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 rounded-full transition-all shadow-lg"
             title={isEditMode ? "Exit Admin Mode" : "Admin Access"}
          >
            <LockIcon className={`w-5 h-5 ${isEditMode ? 'text-green-500' : ''}`} />
          </button>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Admin Access</h3>
              <p className="text-sm text-zinc-500 mt-1">Enter password to edit content</p>
            </div>
            
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={e => {
                    setAdminPassword(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="Password"
                  className={`w-full bg-zinc-950 border ${loginError ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors`}
                  autoFocus
                />
                {loginError && <p className="text-red-500 text-xs mt-2 ml-1">Incorrect password</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold transition-all shadow-lg shadow-indigo-900/20"
              >
                Unlock Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Toolbar (Only visible in Edit Mode) */}
      {isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-[60] flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Edit Mode Active
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline">Click dashed text to edit. Changes save to browser.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={resetContent} className="px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 text-xs font-bold rounded-md transition-colors border border-red-900/50">
              Reset
            </button>
            <button onClick={downloadSourceCode} className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold rounded-md transition-colors border border-zinc-700">
              Download Source
            </button>
            <button onClick={saveChanges} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold rounded-md transition-colors shadow-lg shadow-indigo-500/20">
              Save Locally
            </button>
          </div>
        </div>
      )}
      
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ContentProvider>
      <AppContent />
    </ContentProvider>
  );
};

export default App;