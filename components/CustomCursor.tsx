import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'text' | 'grab'>('default');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is touch-enabled to disable custom cursor
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsMobile(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      if (cursorRingRef.current) {
        // Direct transform for performance
        cursorRingRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isPointer = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.dataset.cursor === 'pointer';
        
      const isText = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'P' || 
        target.tagName === 'SPAN' ||
        target.tagName === 'H1' ||
        target.tagName === 'H2' ||
        target.tagName === 'H3' ||
        target.tagName === 'H4' ||
        target.closest('.editable-text') || 
        target.dataset.cursor === 'text';

      const isGrab = target.dataset.cursor === 'grab' || target.closest('[data-cursor="grab"]');

      if (isGrab) {
        setCursorType('grab');
      } else if (isPointer) {
        setCursorType('pointer');
      } else if (isText) {
        setCursorType('text');
      } else {
        setCursorType('default');
      }
    };

    const onMouseDown = () => {
        if (cursorRingRef.current) {
            cursorRingRef.current.style.transform += ' scale(0.9)';
        }
    }

    const onMouseUp = () => {
        // Animation handled by CSS transition on scale removal
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Main Precision Dot */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform shadow-[0_0_10px_rgba(255,255,255,0.8)]"
      />
      
      {/* Contextual Ring/Shape */}
      <div 
        ref={cursorRingRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] transition-all duration-300 ease-out will-change-transform flex items-center justify-center -translate-x-1/2 -translate-y-1/2
          ${cursorType === 'default' ? 'w-8 h-8 opacity-30 border border-white rounded-full' : ''}
          ${cursorType === 'pointer' ? 'w-12 h-12 bg-white/10 border border-white/50 rounded-full backdrop-blur-[1px]' : ''}
          ${cursorType === 'text' ? 'w-[2px] h-6 bg-indigo-400 rounded-none border-none shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}
          ${cursorType === 'grab' ? 'w-16 h-16 border-2 border-dashed border-indigo-400 rounded-full animate-spin-slow bg-indigo-500/5' : ''}
        `}
      >
        {cursorType === 'grab' && (
             <div className="absolute inset-0 flex items-center justify-center animate-none" style={{ transform: 'rotate(0deg)' }}>
                <span className="text-[8px] font-mono text-indigo-300 font-bold tracking-widest bg-black/50 px-1 rounded">TURN</span>
             </div>
        )}
      </div>
    </>
  );
};

export default CustomCursor;