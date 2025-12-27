import React, { useEffect, useRef, useState, useCallback } from 'react';

const CustomCursor: React.FC = () => {
  const cursorOuterRef = useRef<HTMLDivElement>(null); // The follower (Jelly)
  const cursorInnerRef = useRef<HTMLDivElement>(null); // The precise dot
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  // State for physics
  const mouse = useRef({ x: 0, y: 0 }); // Target position
  const pos = useRef({ x: 0, y: 0 });   // Current position (interpolated)
  const vel = useRef({ x: 0, y: 0 });   // Velocity
  
  // Hover state management
  const [cursorState, setCursorState] = useState<'default' | 'pointer' | 'text' | 'grab' | 'locked'>('default');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsMobile(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Immediate update for inner dot (no lag)
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        // Physics constants
        const smooth = 0.15; // How "heavy" the cursor feels (lower = heavier)
        
        // Linear Interpolation (Lerp)
        pos.current.x += (mouse.current.x - pos.current.x) * smooth;
        pos.current.y += (mouse.current.y - pos.current.y) * smooth;

        // Calculate velocity for squash & stretch
        const vx = mouse.current.x - pos.current.x;
        const vy = mouse.current.y - pos.current.y;
        const velocity = Math.sqrt(vx*vx + vy*vy);
        const maxStretch = 1.5; // Max scale factor
        const scale = Math.min(velocity / 200, maxStretch); // Sensitivity
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);

        if (cursorOuterRef.current) {
          // If locked (magnetized), stick to target, don't stretch
          if (cursorOuterRef.current.dataset.locked === 'true') {
             cursorOuterRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(1)`;
          } else {
             // Apply movement + Physics Stretch
             // We scale X up and Y down based on velocity to simulate elasticity
             const stretch = 1 + scale;
             const squash = 1 - (scale * 0.5);
             
             cursorOuterRef.current.style.transform = `
                translate3d(${pos.current.x}px, ${pos.current.y}px, 0) 
                rotate(${angle}deg) 
                scale(${stretch}, ${squash})
             `;
          }
        }
      }
      
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    // Hover Listeners
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isPointer = target.closest('a') || target.closest('button') || target.closest('[data-cursor="pointer"]');
      const isText = target.closest('p') || target.closest('span') || target.closest('h1') || target.closest('h2') || target.closest('input') || target.closest('textarea') || target.closest('[data-cursor="text"]');
      const isGrab = target.closest('[data-cursor="grab"]');

      if (isGrab) setCursorState('grab');
      else if (isPointer) setCursorState('pointer');
      else if (isText) setCursorState('text');
      else setCursorState('default');
    };

    const onMouseDown = () => {
      setCursorState(prev => prev === 'default' ? 'default' : prev); // Trigger re-render or class change if needed
      if (cursorOuterRef.current) cursorOuterRef.current.classList.add('cursor-click');
    };

    const onMouseUp = () => {
      if (cursorOuterRef.current) cursorOuterRef.current.classList.remove('cursor-click');
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* 
        The Dot: Always precise, follows mouse exactly.
        Using mix-blend-mode: difference to ensure visibility on all backgrounds.
      */}
      <div 
        ref={cursorInnerRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference will-change-transform"
      />

      {/* 
        The Jelly/Follower: Lags behind, stretches, and handles hover states.
      */}
      <div 
        ref={cursorOuterRef}
        data-locked={cursorState === 'locked'}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform flex items-center justify-center transition-colors duration-300
          ${cursorState === 'default' ? 'w-8 h-8 rounded-full border border-zinc-500/50 bg-transparent' : ''}
          ${cursorState === 'pointer' ? 'w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-[2px]' : ''}
          ${cursorState === 'text' ? 'w-1 h-8 bg-indigo-500 rounded-full !rotate-0 !scale-100' : ''}
          ${cursorState === 'grab' ? 'w-20 h-20 rounded-full border-2 border-dashed border-indigo-400 bg-indigo-500/5 animate-[spin_10s_linear_infinite]' : ''}
        `}
      >
         {/* Label for Grab State */}
         {cursorState === 'grab' && (
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-indigo-300 tracking-widest bg-black/60 px-2 rounded backdrop-blur-md">TURN</span>
             </div>
         )}
         
         {/* Label for Pointer State (Optional dynamic context) */}
         {cursorState === 'pointer' && (
           <div className="w-1 h-1 bg-white rounded-full opacity-50" />
         )}
      </div>

      <style>{`
        .cursor-click {
          transform: scale(0.8) !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;