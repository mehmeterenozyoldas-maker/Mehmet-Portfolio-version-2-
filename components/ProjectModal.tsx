import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { XIcon, ExternalLinkIcon, CameraIcon } from './Icons';
import { useContent } from '../contexts/ContentContext';
import EditableText from './EditableText';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

// --- Helper: Editable Image Component with File Upload ---
const EditableImage = ({ 
  src, 
  alt, 
  className, 
  placeholderText,
  onUpdate 
}: { 
  src: string, 
  alt: string, 
  className?: string, 
  placeholderText?: string,
  onUpdate?: (newUrl: string) => void
}) => {
  const { isEditMode } = useContent();
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(src);

  // Sync state with props
  useEffect(() => {
    setInputValue(src);
  }, [src]);

  const handleSave = () => {
    if (onUpdate) onUpdate(inputValue);
    setIsEditing(false);
    setError(false);
  };

  // Compress and Convert Image to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
           // Canvas Resize Logic
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 1000;
           let width = img.width;
           let height = img.height;

           if (width > MAX_WIDTH) {
             height *= MAX_WIDTH / width;
             width = MAX_WIDTH;
           }
           
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx?.drawImage(img, 0, 0, width, height);
           
           // Compress to JPEG 80% quality
           const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
           setInputValue(dataUrl);
           if (onUpdate) onUpdate(dataUrl);
           setIsEditing(false);
           setError(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {!error ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center p-4 text-center">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-mono">Image not found</p>
            <p className="text-indigo-400 text-xs font-bold break-all line-clamp-2">{src.substring(0, 50)}...</p>
            {placeholderText && <p className="text-zinc-600 text-[10px]">{placeholderText}</p>}
          </div>
        </div>
      )}

      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg hover:bg-indigo-500 flex items-center gap-2"
            >
              <CameraIcon className="w-4 h-4" /> Change Image
            </button>
          ) : (
            <div className="bg-zinc-900 p-4 rounded-lg shadow-xl w-[90%] flex flex-col gap-4 border border-zinc-800">
               <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Option A: Paste URL</label>
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs p-2 rounded focus:outline-none focus:border-indigo-500"
                    placeholder="https://..."
                  />
               </div>
               
               <div className="text-center text-zinc-500 text-[10px]">- OR -</div>

               <div>
                  <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Option B: Upload File</label>
                  <label className="flex items-center justify-center w-full p-2 border border-dashed border-zinc-600 rounded bg-zinc-800 cursor-pointer hover:bg-zinc-700">
                     <span className="text-xs text-indigo-400 font-bold">Choose File...</span>
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
               </div>

               <div className="flex gap-2 justify-end mt-2">
                 <button onClick={() => setIsEditing(false)} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
                 <button onClick={handleSave} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500">Save URL</button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Helper: Editable Field for Project Object ---
const EditableProjectField = ({ 
  projectId, 
  field, 
  value, 
  className, 
  multiline, 
  as: Component = 'span' 
}: { 
  projectId: string, 
  field: keyof Project, 
  value: string, 
  className?: string, 
  multiline?: boolean, 
  as?: any 
}) => {
  const { isEditMode, updateProject } = useContent();

  if (isEditMode) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => updateProject(projectId, field, e.target.value)}
          className={`w-full bg-zinc-900/50 border-2 border-dashed border-indigo-500 rounded p-2 text-zinc-100 focus:outline-none focus:border-indigo-400 transition-all ${className}`}
          rows={4}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateProject(projectId, field, e.target.value)}
        className={`bg-zinc-900/50 border-b-2 border-dashed border-indigo-500 px-1 text-zinc-100 focus:outline-none focus:border-indigo-400 transition-all w-full ${className}`}
      />
    );
  }

  return (
    <Component className={className}>
      {value}
    </Component>
  );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { projects, updateProject, updateText, texts } = useContent();
  
  // Find the live project from context to ensure updates are reflected immediately
  const liveProject = projects.find(p => p.id === project.id) || project;

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
        {/* Header Image */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 group">
          <EditableImage 
            src={liveProject.imageUrl} 
            alt={liveProject.title} 
            className="w-full h-full"
            onUpdate={(url) => updateProject(liveProject.id, 'imageUrl', url)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-90 pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md z-10"
          >
            <XIcon className="w-6 h-6" />
          </button>

          <div className="absolute bottom-0 left-0 w-full p-8 z-20">
            <span className="text-indigo-400 text-xs font-bold tracking-wider uppercase px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4 inline-block">
               <EditableProjectField projectId={liveProject.id} field="category" value={liveProject.category} />
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
               <EditableProjectField projectId={liveProject.id} field="title" value={liveProject.title} />
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto terminal-scroll">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-lg text-zinc-300 leading-relaxed">
                   <EditableProjectField projectId={liveProject.id} field="description" value={liveProject.description} multiline />
                </div>
                
                {/* HM Internal Tools Details (Dynamic) */}
                {liveProject.id === 'hm-internal' && (
                  <div className="mt-8 space-y-12">
                     <div>
                       <h4 className="text-white font-bold text-xl mb-3"><EditableText id="hm_intro_title" /></h4>
                       <p className="text-zinc-400 text-sm leading-relaxed"><EditableText id="hm_intro_desc" multiline /></p>
                     </div>

                     <div>
                       <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                         <EditableText id="hm_plm_title" />
                       </h4>
                       <p className="text-zinc-500 text-sm mb-4"><EditableText id="hm_plm_desc" multiline /></p>
                       <div className="grid grid-cols-1 gap-6">
                          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                             <div className="aspect-[16/9] relative bg-zinc-800 flex items-center justify-center">
                                <div className="text-center p-4">
                                  <svg className="w-12 h-12 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                  <p className="text-zinc-500 text-xs font-mono">Product Development & ASQ Lists</p>
                                </div>
                             </div>
                             <div className="p-3 bg-zinc-900 border-t border-zinc-800">
                               <p className="text-xs text-zinc-400"><strong>Unified Views:</strong> Integrating "Excel-like" editing with robust status tracking for thousands of articles.</p>
                             </div>
                          </div>
                       </div>
                     </div>

                     <div>
                       <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                         <EditableText id="hm_aem_title" />
                       </h4>
                       <p className="text-zinc-500 text-sm mb-4"><EditableText id="hm_aem_desc" multiline /></p>
                       <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                           <div className="aspect-[16/9] relative bg-zinc-800 flex items-center justify-center">
                              <div className="text-center p-4">
                                <svg className="w-12 h-12 text-zinc-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-zinc-500 text-xs font-mono">AEM License Asset Library</p>
                              </div>
                           </div>
                       </div>
                     </div>
                  </div>
                )}

                {/* WIP Experiments Details (Updated Layout for 3 Images) */}
                {liveProject.id === 'wip-experiments' && (
                  <div className="mt-8 space-y-12">
                    <div>
                       <h4 className="text-white font-bold text-xl mb-3"><EditableText id="wip_intro_title" /></h4>
                       <p className="text-zinc-400 text-sm leading-relaxed"><EditableText id="wip_intro_desc" multiline /></p>
                    </div>

                    {/* Image Slot 1: The Robot */}
                    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                       <h4 className="text-white font-bold text-lg mb-4"><EditableText id="wip_robot_title" /></h4>
                       <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-6 shadow-lg">
                          <div className="aspect-[4/3] relative">
                             <EditableImage 
                               src={texts['wip_robot_img'] || "assets/wip-robot.jpg"} 
                               alt="Wooden drawing robot"
                               className="w-full h-full"
                               onUpdate={(url) => updateText('wip_robot_img', url)}
                               placeholderText="Click to upload your Robot photo"
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-zinc-400 text-sm mb-4"><EditableText id="wip_robot_desc" multiline /></p>
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded"><EditableText id="wip_robot_tech" /></span>
                          </div>
                          <div className="text-xs text-zinc-500 space-y-2 border-l border-zinc-800 pl-4">
                             <p><strong>Design Intent:</strong> <EditableText id="wip_robot_intent" multiline /></p>
                             <p><strong>Materiality:</strong> <EditableText id="wip_robot_material" multiline /></p>
                          </div>
                       </div>
                    </div>

                    {/* Image Slot 2: Bio Sensing (The Belly) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-white font-bold text-lg"><EditableText id="wip_bio_title" /></h4>
                           <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Bio-Sensing</span>
                        </div>
                        
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 mb-4">
                           <div className="aspect-[16/9] relative">
                             <EditableImage 
                               src={texts['wip_bio_img'] || "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2000&auto=format&fit=crop"} 
                               alt="Bio Sensing Sensor"
                               className="w-full h-full"
                               onUpdate={(url) => updateText('wip_bio_img', url)}
                               placeholderText="Click to upload your Belly Sensor photo"
                             />
                           </div>
                        </div>
                        <p className="text-zinc-400 text-sm"><EditableText id="wip_bio_desc" multiline /></p>
                    </div>

                    {/* Image Slot 3: Form & Mechanism */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-white font-bold text-lg"><EditableText id="wip_haptic_title" /></h4>
                           <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Mechanism</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                                <div className="aspect-square relative">
                                    <EditableImage 
                                    src={texts['wip_mechanism_img'] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"} 
                                    alt="Mechanism"
                                    className="w-full h-full"
                                    onUpdate={(url) => updateText('wip_mechanism_img', url)}
                                    placeholderText="Click to upload your Mechanism photo"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <strong className="text-zinc-300 block mb-1"><EditableText id="wip_form_title" /></strong>
                                    <p className="text-zinc-400 text-sm"><EditableText id="wip_form_desc" multiline /></p>
                                </div>
                                <div className="pt-4 border-t border-zinc-800">
                                    <p className="text-zinc-400 text-sm"><EditableText id="wip_haptic_desc" multiline /></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Technical Deep Dive (Slides 21-22) */}
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <h4 className="text-white font-bold text-lg mb-4">Technical Deep Dive (Slides 21-22)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                                    <EditableImage 
                                        src={texts['wip_slide_21_img'] || "..."} 
                                        alt="Technical Detail 1"
                                        className="w-full h-full"
                                        onUpdate={(url) => updateText('wip_slide_21_img', url)}
                                        placeholderText="Click to upload Image from Slide 21"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 text-center font-mono uppercase tracking-wide">Slide 21: Component Details</p>
                            </div>
                            <div className="space-y-2">
                                <div className="aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                                    <EditableImage 
                                        src={texts['wip_slide_22_img'] || "..."} 
                                        alt="Technical Detail 2"
                                        className="w-full h-full"
                                        onUpdate={(url) => updateText('wip_slide_22_img', url)}
                                        placeholderText="Click to upload Image from Slide 22"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 text-center font-mono uppercase tracking-wide">Slide 22: Assembly & Logic</p>
                            </div>
                        </div>
                    </div>

                  </div>
                )}

                {/* Building Trust with AI (Colors) */}
                {liveProject.id === 'trust-ai-colors' && (
                  <div className="mt-8 space-y-12">
                    <div>
                        <h4 className="text-white font-bold text-xl mb-3"><EditableText id="trust_intro_title" /></h4>
                        <p className="text-zinc-400 text-sm leading-relaxed"><EditableText id="trust_intro_desc" multiline /></p>
                    </div>

                    {/* Image 1: Workbench (Landscape) */}
                    <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                           <div className="aspect-video relative">
                             <EditableImage 
                               src={texts['trust_img_1'] || "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=2070&auto=format&fit=crop"} 
                               alt="Workbench Setup"
                               className="w-full h-full"
                               onUpdate={(url) => updateText('trust_img_1', url)}
                               placeholderText="Click to Upload: Workbench Landscape"
                             />
                           </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono text-center">Experimental Setup: Arduino, iPad Probes, and Electronics</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex flex-col gap-4">
                            <div className="border-l-2 border-red-500 pl-4">
                                <h5 className="text-white font-bold text-sm mb-1">Problem</h5>
                                <p className="text-zinc-400 text-xs leading-relaxed"><EditableText id="trust_problem" multiline /></p>
                            </div>
                            <div className="border-l-2 border-green-500 pl-4">
                                <h5 className="text-white font-bold text-sm mb-1">Speculative Solution</h5>
                                <p className="text-zinc-400 text-xs leading-relaxed"><EditableText id="trust_solution" multiline /></p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid: Prototype + AI Art */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image 2: Prototype (Span 2) */}
                        <div className="md:col-span-2 space-y-2">
                            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 h-full">
                               <div className="aspect-[4/3] relative h-full">
                                 <EditableImage 
                                   src={texts['trust_img_2'] || "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=2070&auto=format&fit=crop"} 
                                   alt="Prototype Detail"
                                   className="w-full h-full"
                                   onUpdate={(url) => updateText('trust_img_2', url)}
                                   placeholderText="Click to Upload: Prototype Close-up"
                                 />
                               </div>
                            </div>
                            <p className="text-xs text-zinc-500 font-mono">Lo-fi Prototyping: Cardboard & Circuits</p>
                        </div>

                        {/* Image 3: AI Art (Span 1 - Portrait) */}
                        <div className="space-y-2">
                            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 h-full">
                               <div className="aspect-[3/5] relative h-full">
                                 <EditableImage 
                                   src={texts['trust_img_3'] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop"} 
                                   alt="AI Generated Vision"
                                   className="w-full h-full"
                                   onUpdate={(url) => updateText('trust_img_3', url)}
                                   placeholderText="Click to Upload: AI Art (Vertical)"
                                 />
                               </div>
                            </div>
                            <p className="text-xs text-zinc-500 font-mono">AI Visualization (Wombo)</p>
                        </div>
                    </div>

                    <div>
                         <p className="text-zinc-400 text-sm"><EditableText id="trust_prototype_desc" multiline /></p>
                    </div>
                  </div>
                )}

                {/* Future of Parenthood */}
                {liveProject.id === 'future-parenthood' && (
                  <div className="mt-8 space-y-12">
                    <div>
                        <h4 className="text-white font-bold text-xl mb-3"><EditableText id="parent_intro_title" /></h4>
                        <p className="text-zinc-400 text-sm leading-relaxed"><EditableText id="parent_intro_desc" multiline /></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                            <h5 className="text-indigo-400 font-bold text-sm mb-2 uppercase tracking-wide">Dystopian Narrative</h5>
                            <p className="text-zinc-300 text-xs leading-relaxed mb-4"><EditableText id="parent_dystopia" multiline /></p>
                            <div className="aspect-video relative rounded-lg overflow-hidden border border-zinc-700">
                                <EditableImage 
                                    src={texts['parent_img_1'] || "https://images.unsplash.com/photo-1535378437327-664c8603583f?q=80&w=2071&auto=format&fit=crop"} 
                                    alt="Robot Companion"
                                    className="w-full h-full"
                                    onUpdate={(url) => updateText('parent_img_1', url)}
                                    placeholderText="Upload Robot Concept"
                                />
                            </div>
                        </div>
                        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                            <h5 className="text-pink-400 font-bold text-sm mb-2 uppercase tracking-wide">Participatory Process</h5>
                            <p className="text-zinc-300 text-xs leading-relaxed mb-4"><EditableText id="parent_process" multiline /></p>
                            <div className="aspect-video relative rounded-lg overflow-hidden border border-zinc-700">
                                <EditableImage 
                                    src={texts['parent_img_2'] || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"} 
                                    alt="Workshop Process"
                                    className="w-full h-full"
                                    onUpdate={(url) => updateText('parent_img_2', url)}
                                    placeholderText="Upload Workshop Photo"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-6">
                        <h4 className="text-white font-bold text-lg mb-2">Key Insight</h4>
                        <p className="text-zinc-400 text-sm italic border-l-2 border-zinc-600 pl-4">
                            <EditableText id="parent_insight" multiline />
                        </p>
                    </div>
                  </div>
                )}

                {/* Bliss Details */}
                {liveProject.id === 'bliss' && (
                  <div className="mt-6 space-y-8 text-zinc-400 text-sm">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">Mission</h4>
                      <p>Develop new ways of everyday communication that nurture presence and intimate connection, without another screen. Bliss is a small, compass‑like object that helps two people orient toward each other and feel <em>aligned</em> in the moment — even when far apart.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">Solution</h4>
                      <p>By moving the hand‑held object you “tune” toward a loved one; an arrow indicates when you’re standing face‑to‑face. As you move, their compass mirrors your motion. Together you perform a subtle dance of attention and care — a calm moment of focus we call <em>bliss</em>.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <div>
                            <h5 className="text-indigo-400 font-bold mb-1">Methods</h5>
                            <p className="text-xs">Co-sketching & Bodystorming to think with hands. Props served as conversational probes.</p>
                        </div>
                        <div>
                            <h5 className="text-indigo-400 font-bold mb-1">Insights</h5>
                            <p className="text-xs">"Hugging the sun", nurturing acts, and forest walking informed the quiet, embodied interaction style.</p>
                        </div>
                    </div>
                  </div>
                )}

                {/* Placeholder for generic projects */}
                {!['co-mine', 'carehood', 'scania', 'politics-of-fear', 'bliss', 'sketching', 'hm-internal', 'wip-experiments', 'trust-ai-colors', 'future-parenthood'].includes(liveProject.id) && (
                   <p className="mt-4 text-zinc-500 italic">
                     Detailed case study content would populate here, including process images, sketches, and further research findings.
                   </p>
                )}
              </div>
            </div>

            {/* Right Column: Meta */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Technologies & Methods</h3>
                <div className="flex flex-wrap gap-2">
                  {liveProject.tags.map(tag => (
                    <span key={tag} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {liveProject.link && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Links</h3>
                  <a 
                    href={liveProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                  >
                    View Source / Live <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;