import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Experience, Education } from '../types';

// --- Default Data (Updated via Admin Mode) ---

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'hm-internal',
    title: 'H&M Internal Tools',
    category: 'Enterprise UX',
    description: 'Redesigning the core operational tools for one of the world\'s largest fashion retailers. Focusing on PLM, Assortment Planning (ASQ), and Asset Management (AEM) to streamline complex workflows.',
    imageUrl: 'https://images.unsplash.com/photo-1586772002130-b0f3daa6288b?q=80&w=2070&auto=format&fit=crop', // Placeholder: Modern Office/Data
    tags: ['Enterprise UX', 'Design Systems', 'User Research', 'Complex Data'],
    featured: false
  },
  {
    id: 'future-parenthood',
    title: 'Future of Parenthood',
    category: 'Speculative Design',
    description: 'A critical investigation into reproductive healthcare using Participatory Design and AI. Exploring dystopian futures of "Parenthood Licenses" and social credit robots.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5b2b0e8b3b72?q=80&w=2071&auto=format&fit=crop', // Medical/Lab placeholder
    tags: ['Bio-Politics', 'AI Gen', 'Participatory Design', 'Healthcare'],
    featured: true
  },
  {
    id: 'trust-ai-colors',
    title: 'Building Trust with AI',
    category: 'Physical Computing',
    description: 'Designing for the "Gatekeepers of Cognitive Safety". Using tangible interaction and color-coding to reduce trauma for content moderators working with AI.',
    imageUrl: 'assets/trust-1-setup.jpg', // UPDATED: Relative path for GitHub Pages
    tags: ['Tangible UI', 'AI Ethics', 'Ethnography', 'Well-being'],
    featured: true
  },
  {
    id: 'wip-experiments',
    title: 'WIP: Tangible Experiments',
    category: 'Creative Engineering',
    description: 'Sketching in hardware. From a wooden drawing robot companion to intimate copper-tape bio-sensors for pregnancy tracking.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop', // Robotics Placeholder
    tags: ['Robotics', 'Arduino', 'Bio-Sensing', 'Prototyping'],
    featured: false
  },
  {
    id: 'bliss',
    title: 'Bliss',
    category: 'Tangible Interaction',
    description: 'A compass-like tangible device designed to help loved ones align and share moments of presence across distances without screens.',
    imageUrl: 'https://static1.squarespace.com/static/5e3aec7e4d9f7114b850b30c/5e3aec991708cc3728fe6864/5f854efb241b634e31c1c225/1610183279064/untitled.158sdsds+-+Copy.png?format=1500w',
    tags: ['Tangible UI', 'Presence', 'IoT', 'p5.js'],
    featured: false
  },
  {
    id: 'sketching',
    title: 'Sketching',
    category: 'Visual Design',
    description: 'A collection of industrial design sketches and visual experiments. "I have a problem with dodging and sketching :)"',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1582652840819-U6VT9DWCB8Z274KX441J/Untitled+28.png?format=1500w',
    tags: ['Industrial Design', 'Sketching', 'Visual Communication']
  },
  {
    id: 'avatar-twin',
    title: 'Interactive 3D Digital Twin',
    category: 'Creative Coding',
    description: '200+ vibe coded creative experiences and products, interactive installations, creative design tools, speculative mini projects, and games for kids.',
    imageUrl: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2000&auto=format&fit=crop',
    tags: ['React Three Fiber', 'WebGL', 'Generative Design', 'Interactive']
  },
  {
    id: 'co-mine',
    title: 'Co-Mine',
    category: 'Interaction Design',
    description: 'Autonomous but not anonymous. A collaborative mining table interface for 2030, empowering operators with tangible tools for macro and micro planning. Exploring how to keep humans in the loop of automation.',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1580920022287-7H9OYU0U057SZVQV3QQS/aSAsa.jpg',
    tags: ['Interaction Design', 'Industrial Design', 'HCD', 'Tangible UI']
  },
  {
    id: 'carehood',
    title: 'Carehood',
    category: 'Service Design',
    description: 'Helping Laerdal to Help People. A system that humanizes emergency response by creating a "warm blanket" of community support around patients and bystanders in rural areas.',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1586075918384-E36GM3T65JGZXHZGCRYX/app_resized.png',
    tags: ['UX Research', 'Service Design', 'Co-creation', 'App Design']
  },
  {
    id: 'tradhus',
    title: 'Tradhus',
    category: 'Service Design',
    description: 'Sustainable living and behavior change. A service connecting Umea Energi with students to reduce consumption and foster community in dorms through shared "treehouse" principles.',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1582034300062-JHVHN7278768GRIGT810/2.47gggg.jpg',
    tags: ['Sustainability', 'Behavior Change', 'Service Design', 'IoT']
  },
  {
    id: 'scania',
    title: 'Scania UX Research',
    category: 'UX Research',
    description: 'Design ethnography and qualitative content analysis for the automotive industry. Investigating driver well-being and future transport systems through field studies and body storming.',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1582564260719-HGYI7JND68YUURLF6T9V/IMG_0269.JPG',
    tags: ['Design Ethnography', 'Automotive', 'UX', 'Field Research']
  },
  {
    id: 'politics-of-fear',
    title: 'Politics of Fear',
    category: 'Speculative Design',
    description: 'A series of artifacts (Lie Detector Passport, Refugee Boat) questioning the biopolitics of borders. Using performative design to let users experience the "otherness" created by fear-based politics.',
    imageUrl: 'https://images.squarespace-cdn.com/content/v1/5e3aec7e4d9f7114b850b30c/1594203559190/Untitled-3.jpg',
    tags: ['Critical Design', 'Speculative Design', 'Prototyping', 'Norm Criticality']
  }
];

const DEFAULT_EXPERIENCE: Experience[] = [
  {
    id: 'techne',
    role: 'Creative Director',
    company: 'Techne: Low-fi Thought Object',
    period: 'July 2024 – Present',
    description: 'Lead a speculative design agency focused on experiments and educational content. Developing thought-provoking artifacts via auto-ethnographic and participatory research.',
    skills: ['Speculative Design', 'Creative Direction']
  },
  {
    id: 'hm-group',
    role: 'Experience Designer / UX Researcher',
    company: 'H&M Group',
    period: 'June 2023 – Present',
    description: 'Dual role in Product Design & Asset Management. Exploring generative AI and 2D/3D pipelines. Utilizing participatory design and ethnographic research.',
    skills: ['Generative AI', '3D Pipelines', 'Ethnography']
  },
  {
    id: 'hm-uxr',
    role: 'UX Researcher',
    company: 'H&M Group',
    period: 'Apr 2023 – May 2023',
    description: 'Researched production processes and developed a 3D pipeline strategy.',
    skills: []
  },
  {
    id: 'hm-pd',
    role: 'Product Design and UX Researcher',
    company: 'H&M Group',
    period: 'Apr 2022 – Apr 2023',
    description: 'Designed business applications in the assortment and planning domain using ethnographic methods.',
    skills: []
  },
  {
    id: 'mentor',
    role: 'Design Mentor',
    company: 'Self-Employed / adplist.org',
    period: 'May 2021 – Present',
    description: 'Mentoring graduates and university students on cultural norms, professional behavior, and portfolio development.',
    skills: []
  },
  {
    id: 'freelance',
    role: 'Freelance Product Designer',
    company: 'Self-Employed',
    period: 'Aug 2017 – Jan 2024',
    description: 'Consulted in industrial design, UX research, and service design for projects ranging from AI-driven tools to social innovation.',
    skills: []
  }
];

const DEFAULT_TEXTS: Record<string, string> = {
  hero_title_1: "Designer •",
  hero_title_2: "Futurist •",
  hero_title_3: "Researcher.",
  hero_bio: "I'm Mehmet. I blend traditional industrial design with cutting-edge approaches in UX, service, and speculative design. Currently exploring future product ecosystems at H&M Group and running Techne.",
  profile_summary_1: "I'm Mehmet - a multidisciplinary designer and researcher with a rich multicultural heritage. Passionate about understanding people and the norms that shape our lives, I believe designers must become facilitators and activists.",
  profile_summary_2: "My work blends traditional industrial design with cutting-edge approaches in UX, service, and speculative design. Currently, I leverage emerging technologies (3D, XR, Gen AI) at H&M to explore future product ecosystems, while leading a speculative design agency, Techne.",
  profile_quote: "\"It is okay to say slow me down change topic to kids, Linköping HC, or new ai tools to try out.\"",
  contact_headline: "Let's shape the future.",
  contact_sub: "Open to discussing Social Innovation, Circular Design, and the ethics of AI.",

  // --- H&M Internal Tools Content ---
  hm_intro_title: "Transforming Enterprise Workflows",
  hm_intro_desc: "H&M Group relies on a vast ecosystem of internal tools to manage everything from initial product sketches to global assortment planning. My role focused on harmonizing these disparate systems—specifically Product Lifecycle Management (PLM), Assortment Planning (ASQ), and Asset Management (AEM) to reduce cognitive load and increase efficiency for merchandisers and product developers.",
  hm_plm_title: "Managing Complexity: PLM & ASQ",
  hm_plm_desc: "Moving away from legacy interfaces to responsive, smart data grids. The challenge was to maintain high information density while improving readability and filtering capabilities.",
  hm_aem_title: "Visual Asset Management (AEM)",
  hm_aem_desc: "Designers need quick access to licensed assets (e.g., Disney, Pokemon) and print files. We implemented a visual-first folder structure in Adobe Experience Manager to streamline discovery and compliance.",
  
  // --- WIP Experiments Content ---
  wip_intro_title: "Sketching in Hardware",
  wip_intro_desc: "This collection represents my ongoing practice of thinking through making. Whether it's a wooden robot companion or soft-circuit bio-sensors, I use physical prototyping to explore how digital intelligence can manifest in our tangible reality.",
  wip_robot_title: "The Drawing Companion",
  wip_robot_desc: "An autonomous drawing vehicle designed to collaborate with children. Using simple distance sensors and random-walk algorithms, it creates 'collaborative chaos' on large sheets of paper.",
  wip_robot_tech: "Arduino Uno + Custom Wood Chassis",
  wip_robot_intent: "To move away from screen-based creativity and re-introduce physical, messy, shared play.",
  wip_robot_material: "Wood was chosen over plastic to give the object a warmer, furniture-like quality that fits into a home environment.",
  wip_robot_img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
  wip_process_title: "Process & Exploration",
  wip_bio_img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2000&auto=format&fit=crop", 
  wip_mechanism_img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
  wip_slide_21_img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", 
  wip_slide_22_img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop", 
  wip_bio_title: "01. Bio-Sensing",
  wip_bio_desc: "Using copper tape and capacitive sensing to create non-invasive, intimate interfaces for pregnancy tracking.",
  wip_form_title: "02. Form Giving",
  wip_form_desc: "Clay modeling to explore organic shapes that invite touch and hold, moving away from 'gadget' aesthetics.",
  wip_haptic_title: "03. Mechanism & Haptics",
  wip_haptic_desc: "Iterating on internal mechanisms to translate data into subtle vibration patterns rather than numbers.",

  // --- Trust with AI Content ---
  trust_intro_title: "Gatekeepers of Cognitive Safety",
  trust_intro_desc: "Content moderators face the overwhelming task of filtering harmful and criminal content daily. This project explores how we can build trust between human operators and AI to reduce cognitive load and trauma.",
  trust_problem: "The Challenge: Constant exposure to graphic content leads to severe burnout. Current interfaces force operators to 'see' everything.",
  trust_solution: "The Proposal: Using abstraction (colors) and tangible knobs to filter content severity. AI pre-processes harmful data into color codes, allowing the human to manage safety without direct exposure.",
  trust_prototype_desc: "Wooden 'Prayer Artifacts' used as tangible controllers. Whispering to AI establishes intimacy, while the color sensor and RGB feedback create a calm, meditative interaction loop.",
  // UPDATED: Relative paths for GitHub Pages hosting
  trust_img_1: "assets/trust-1-setup.jpg", // Workbench
  trust_img_2: "assets/trust-2-prototype.jpg", // Prototype
  trust_img_3: "assets/trust-3-art.jpg", // AI Art

  // --- Future of Parenthood Content ---
  parent_intro_title: "The Parenthood License",
  parent_intro_desc: "A speculative design project exploring a dystopian future where couples must pass a series of trials to obtain a 'Parenthood License'. What if your ability to parent was assessed by a robot?",
  parent_dystopia: "The Scenario: Based on social credit scores, candidates receive a robotic child. They must maintain its 'energy level' and teach it national values.",
  parent_process: "Methodology: We used AI image generation (Midjourney) + Participatory Design to co-create these narratives. The 'Privilege Wheel' activity helped participants unlearn biases.",
  parent_insight: "Critical Reflection: Participants found the medical artifacts 'scary'. We pivoted to designing 'Care Kits' inspired by gardening tools—treating patients like plants that need nurturing.",
  parent_img_1: "https://images.unsplash.com/photo-1535378437327-664c8603583f?q=80&w=2071&auto=format&fit=crop", // Robot/AI
  parent_img_2: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" // Medical/Future
};

// --- Context Definition ---

interface ContentContextType {
  projects: Project[];
  experience: Experience[];
  texts: Record<string, string>;
  isEditMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  updateText: (key: string, value: string) => void;
  updateProject: (id: string, field: keyof Project, value: any) => void;
  saveChanges: () => void;
  resetContent: () => void;
  exportContent: () => void;
  downloadSourceCode: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [experience, setExperience] = useState<Experience[]>(DEFAULT_EXPERIENCE);
  const [texts, setTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);

  // Load from local storage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('portfolio_projects');
    const savedExperience = localStorage.getItem('portfolio_experience');
    const savedTexts = localStorage.getItem('portfolio_texts');

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedExperience) setExperience(JSON.parse(savedExperience));
    if (savedTexts) setTexts(JSON.parse(savedTexts));
  }, []);

  const login = (password: string) => {
    // Simple client-side check. In a real app, use auth.
    if (password === 'admin') {
      setIsEditMode(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsEditMode(false);

  const updateText = (key: string, value: string) => {
    setTexts(prev => ({ ...prev, [key]: value }));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveChanges = () => {
    try {
      localStorage.setItem('portfolio_projects', JSON.stringify(projects));
      localStorage.setItem('portfolio_experience', JSON.stringify(experience));
      localStorage.setItem('portfolio_texts', JSON.stringify(texts));
      alert('Content saved to this browser!');
    } catch (e) {
      alert('Storage quota exceeded! Your images might be too large. Try uploading smaller images.');
    }
  };

  const resetContent = () => {
    if (window.confirm('Reset all content to defaults? This cannot be undone.')) {
      setProjects(DEFAULT_PROJECTS);
      setExperience(DEFAULT_EXPERIENCE);
      setTexts(DEFAULT_TEXTS);
      localStorage.removeItem('portfolio_projects');
      localStorage.removeItem('portfolio_experience');
      localStorage.removeItem('portfolio_texts');
    }
  };

  const exportContent = () => {
    const data = { projects, experience, texts };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Content JSON copied to clipboard! You can use this to update the codebase.');
  };

  const downloadSourceCode = () => {
    alert('To download the source, please use the current active function!');
  };

  return (
    <ContentContext.Provider value={{
      projects,
      experience,
      texts,
      isEditMode,
      login,
      logout,
      updateText,
      updateProject,
      saveChanges,
      resetContent,
      exportContent,
      downloadSourceCode
    }}>
      {children}
    </ContentContext.Provider>
  );
};
