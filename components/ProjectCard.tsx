import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className={`group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-500 ease-out cursor-none h-full
        hover:border-indigo-500/50 hover:-translate-y-2 hover:scale-[1.02] 
        hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)]
        hover:ring-1 hover:ring-indigo-500/20`}
      onClick={onClick}
      data-cursor="pointer"
    >
      {/* Image Container */}
      <div className={`overflow-hidden relative w-full bg-zinc-800 ${project.featured ? 'h-96 md:h-full' : 'h-64'}`}>
        
        {/* Loading Placeholder */}
        <div className={`absolute inset-0 bg-zinc-800 flex items-center justify-center transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>

        <img 
          src={project.imageUrl} 
          alt={project.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transform group-hover:scale-110 transition-all duration-700 ease-out 
            ${imageLoaded ? 'opacity-100 grayscale group-hover:grayscale-0' : 'opacity-0 scale-105'}
          `}
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Centered Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
          <div className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm transform scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl flex items-center gap-2">
            <span>View Case Study</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 backdrop-blur-md">
              {project.category}
            </span>
          </div>
          
          <h3 className={`font-bold text-white mb-2 leading-tight transition-colors group-hover:text-indigo-100 ${project.featured ? 'text-3xl' : 'text-xl'}`}>
            {project.title}
          </h3>
          
          <p className="text-zinc-400 text-sm line-clamp-3 mb-4 group-hover:text-zinc-300 transition-colors duration-300">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded-md bg-zinc-950/50">
                #{tag.replace(/\s+/g, '').toLowerCase()}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] font-mono text-zinc-600 px-1 py-1">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;