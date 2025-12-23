import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, HandIcon } from './Icons';
import { useContent } from '../contexts/ContentContext';
import EditableText from './EditableText';

// --- Data Definitions ---

interface CVSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const InteractiveCV: React.FC = () => {
  const { experience, isEditMode } = useContent();
  const [activeSection, setActiveSection] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Gesture State
  const [gestureStatus, setGestureStatus] = useState<'idle' | 'next' | 'prev'>('idle');
  const [gestureProgress, setGestureProgress] = useState(0);
  const [activeHandPos, setActiveHandPos] = useState<{x: number, y: number} | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const gestureTimerRef = useRef<number>(0);
  const lastGestureTimeRef = useRef<number>(0);
  
  // Thresholds
  const GESTURE_THRESHOLD = 1000;
  const COOLDOWN_TIME = 2000;
  const CONFIDENCE_THRESHOLD = 0.6;
  const WRIST_OFFSET = 60;

  // Education data kept static 
  const EDUCATION_DATA: { school: string; degree: string; period: string; description?: string }[] = [
    { school: 'Umeå Institute of Design', degree: 'MFA Interaction Design (IxD) & IDI', period: '2018 – 2020' },
    { school: 'Domus Academy', degree: 'MA, Master of Car Design', period: '2011 – 2012' },
    { school: 'Luleå University of Technology', degree: 'Course: Intro to Computer Game Creation', period: 'Jan 2025 – June 2025' },
    { school: 'Halmstad University', degree: 'Courses: Design of Circular AI-Based Services, UX for AI', period: '2022 – 2023' },
    { school: 'Linnaeus University', degree: 'MA, Design+Change', period: '2017 – 2020' },
    { school: 'Eastern Mediterranean University', degree: 'BA, Industrial Design', period: '2006 – 2011' }
  ];

  const SKILLS_LIST = [
    'Interdisciplinary Design Research', 'UX & Service Design', 'Participatory & Speculative Design',
    'Digital Fabrication', 'Human-Centered Innovation', 'Design Thinking', 'XR Design (Basics)',
    'Aesthetics of Interaction', 'Computational Design (Basics)', 'AI Ethics',
    'Design Ethnography', 'CAD'
  ];

  // Section Configuration
  const sections: CVSection[] = [
    {
      id: 'profile',
      title: 'Profile Summary',
      content: (
        <div className="space-y-6 animate-fade-in">
          <p className="text-xl leading-relaxed text-zinc-300">
            <EditableText id="profile_summary_1" multiline />
          </p>
          <p className="text-lg leading-relaxed text-zinc-400">
            <EditableText id="profile_summary_2" multiline />
          </p>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
             <h4 className="text-indigo-400 font-bold mb-2">Core Philosophy</h4>
             <p className="text-sm text-zinc-400 italic">
               <EditableText id="profile_quote" />
             </p>
          </div>
        </div>
      )
    },
    {
      id: 'work',
      title: 'Work Experience',
      content: (
        <div className="space-y-8 animate-fade-in terminal-scroll max-h-[400px] overflow-y-auto pr-2">
          {experience.map((job, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-zinc-800 hover:border-indigo-500 transition-colors group">
              <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-950 border-2 border-zinc-600 rounded-full group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-all" />
              <h4 className="text-lg font-bold text-white">{job.role}</h4>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-indigo-400">{job.company}</span>
                <span className="text-zinc-500 font-mono">{job.period}</span>
              </div>
              <p className="text-zinc-400 text-sm mb-2">{job.description}</p>
              {job.skills && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.map(s => (
                    <span key={s} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education',
      content: (
        <div className="space-y-6 animate-fade-in terminal-scroll max-h-[400px] overflow-y-auto pr-2">
          {EDUCATION_DATA.map((edu, idx) => (
            <div key={idx} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-zinc-200">{edu.school}</h4>
                <span className="text-xs text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded">{edu.period}</span>
              </div>
              <p className="text-indigo-400 text-sm mb-1">{edu.degree}</p>
              {edu.description && <p className="text-zinc-500 text-xs">{edu.description}</p>}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'skills',
      title: 'Skills & Interests',
      content: (
        <div className="animate-fade-in">
           <div className="flex flex-wrap gap-3">
             {SKILLS_LIST.map((skill, idx) => (
               <span 
                 key={idx} 
                 className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white hover:border-indigo-500 transition-all cursor-default"
               >
                 {skill}
               </span>
             ))}
           </div>
           
           <div className="mt-8">
             <h4 className="text-lg font-bold mb-4">Certifications & Honors</h4>
             <ul className="space-y-2 text-sm text-zinc-400">
               <li>• CGMAA & Interaction 23</li>
               <li>• IMMIB Design Competition 2016/2017 (Second Round)</li>
               <li>• Citroen Creative Awards 2012 (Shortlisted)</li>
               <li>• IXDA Awards (Shortlisted) - <em>"The most proud meaningful to me"</em></li>
             </ul>
           </div>
        </div>
      )
    }
  ];

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    setCameraError(null);
  };

  // Initialize PoseNet & Attach Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    let poseNet: any;

    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          const ml5 = (window as any).ml5;
          if (ml5) {
            poseNet = ml5.poseNet(videoRef.current, {
              flipHorizontal: true,
              detectionType: 'single'
            }, () => {
              console.log('PoseNet Loaded');
            });

            poseNet.on('pose', (results: any[]) => {
               if (results.length > 0) {
                 handlePose(results[0].pose);
               } else {
                 setActiveHandPos(null);
               }
            });
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Camera access denied.");
        setCameraActive(false);
      }
    };

    if (cameraActive) {
      setupCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
         videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (poseNet) poseNet.removeAllListeners();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [cameraActive]);

  // Gesture Logic
  const handlePose = (pose: any) => {
    const now = Date.now();
    
    const rightWrist = pose.rightWrist;
    const rightShoulder = pose.rightShoulder;
    const leftWrist = pose.leftWrist;
    const leftShoulder = pose.leftShoulder;

    const isRightRaised = rightWrist.confidence > CONFIDENCE_THRESHOLD && 
                          rightShoulder.confidence > CONFIDENCE_THRESHOLD && 
                          rightWrist.y < (rightShoulder.y - WRIST_OFFSET);

    const isLeftRaised = leftWrist.confidence > CONFIDENCE_THRESHOLD && 
                         leftShoulder.confidence > CONFIDENCE_THRESHOLD && 
                         leftWrist.y < (leftShoulder.y - WRIST_OFFSET);

    if (isRightRaised) {
      setActiveHandPos({ x: rightWrist.x, y: rightWrist.y });
    } else if (isLeftRaised) {
      setActiveHandPos({ x: leftWrist.x, y: leftWrist.y });
    } else {
      setActiveHandPos(null);
    }

    if (now < lastGestureTimeRef.current + COOLDOWN_TIME) {
      setGestureStatus('idle');
      setGestureProgress(0);
      return;
    }

    if (isRightRaised) {
       updateGesture('next', 16);
    } 
    else if (isLeftRaised) {
       updateGesture('prev', 16);
    } 
    else {
      gestureTimerRef.current = Math.max(0, gestureTimerRef.current - 50);
      if (gestureTimerRef.current === 0) {
        setGestureStatus('idle');
        setGestureProgress(0);
      } else {
        setGestureProgress((gestureTimerRef.current / GESTURE_THRESHOLD) * 100);
      }
    }
  };

  const updateGesture = (type: 'next' | 'prev', delta: number) => {
    setGestureStatus(type);
    gestureTimerRef.current += delta;
    const progress = Math.min((gestureTimerRef.current / GESTURE_THRESHOLD) * 100, 100);
    setGestureProgress(progress);

    if (gestureTimerRef.current >= GESTURE_THRESHOLD) {
      if (type === 'next') {
        setActiveSection(prev => (prev + 1) % sections.length);
      } else {
        setActiveSection(prev => (prev - 1 + sections.length) % sections.length);
      }
      
      lastGestureTimeRef.current = Date.now();
      gestureTimerRef.current = 0;
      setGestureStatus('idle');
      setGestureProgress(0);
      setActiveHandPos(null);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Top Bar / Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 p-4 flex justify-between items-center backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
        </div>
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
           Interactive Terminal v2.5
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Sidebar: Navigation & Camera */}
        <div className="lg:col-span-3 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(idx)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex justify-between items-center group relative ${
                  activeSection === idx 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-2' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <span>{section.title}</span>
                {activeSection === idx ? (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                ) : (
                  <span className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity text-xs">→</span>
                )}
              </button>
            ))}
          </nav>

          {/* Camera / Gesture Module */}
          <div className="mt-8 relative">
             <div className="border border-zinc-700 bg-black rounded-xl overflow-hidden relative aspect-[4/3] flex items-center justify-center group">
               {!cameraActive ? (
                 <div className="flex flex-col items-center justify-center p-4 text-center h-full w-full bg-zinc-900/80">
                   {cameraError ? (
                     <div className="text-red-400 mb-3 animate-fade-in">
                        <span className="block text-xs font-bold mb-1">Error</span>
                        <span className="text-[10px]">{cameraError}</span>
                     </div>
                   ) : null}
                   <button 
                     onClick={toggleCamera}
                     className="flex flex-col items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors p-2"
                   >
                     <CameraIcon className="w-8 h-8" />
                     <span className="text-xs font-bold">Enable Gesture Control</span>
                   </button>
                 </div>
               ) : (
                 <>
                   <video 
                     ref={videoRef} 
                     width="320" 
                     height="240" 
                     className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all transform -scale-x-100" 
                     muted
                     playsInline
                   />
                   
                   {/* Gesture Overlay UI */}
                   <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {/* Detected Hand Visualizer */}
                      {activeHandPos && (
                        <div 
                          className="absolute w-12 h-12 rounded-full border-2 border-indigo-400 bg-indigo-500/20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                          style={{ 
                            left: `${(activeHandPos.x / 320) * 100}%`, 
                            top: `${(activeHandPos.y / 240) * 100}%` 
                          }}
                        >
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                        </div>
                      )}

                      {/* Progress Circle & Status */}
                      {gestureStatus !== 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                          <div className="text-center">
                            <div className={`w-16 h-16 rounded-full border-4 border-zinc-800 flex items-center justify-center relative`}>
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle 
                                  cx="32" cy="32" r="28" 
                                  stroke="currentColor" 
                                  strokeWidth="4" 
                                  fill="none"
                                  className="text-indigo-500 transition-all duration-75"
                                  strokeDasharray="175"
                                  strokeDashoffset={175 - (175 * gestureProgress) / 100}
                                />
                              </svg>
                              <HandIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-bold text-indigo-400 mt-2 block uppercase tracking-wider bg-black/50 px-2 py-1 rounded">
                              {gestureStatus === 'next' ? 'Next' : 'Prev'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Active Status Dot */}
                      <div className="absolute top-2 right-2">
                           <span className="flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                           </span>
                      </div>
                   </div>
                 </>
               )}
             </div>
             {cameraActive && (
               <div className="mt-3 text-[10px] text-zinc-500 text-center font-mono space-y-1">
                 <p>RAISE RIGHT HAND: NEXT</p>
                 <p>RAISE LEFT HAND: PREV</p>
                 <button onClick={toggleCamera} className="text-red-400 hover:text-red-300 mt-2 underline">Stop Camera</button>
               </div>
             )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 p-8 md:p-12 relative flex flex-col bg-zinc-950/50">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
              {sections[activeSection].title}
            </h2>
            <div key={activeSection}>
              {sections[activeSection].content}
            </div>
          </div>
          
          {/* Navigation Hints */}
          <div className="mt-8 flex justify-between text-zinc-600 text-sm font-mono border-t border-zinc-900 pt-4">
             <button 
               onClick={() => setActiveSection(prev => (prev - 1 + sections.length) % sections.length)}
               className="hover:text-white transition-colors flex items-center gap-2"
             >
               ← PREV
             </button>
             <button 
               onClick={() => setActiveSection(prev => (prev + 1) % sections.length)}
               className="hover:text-white transition-colors flex items-center gap-2"
             >
               NEXT →
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCV;