import React, { useRef, useState } from 'react';

interface MagneticProps {
  children: React.ReactElement;
  strength?: number; // How far it moves (Translation)
  tilt?: number;     // How much it rotates (Rotation)
  className?: string;
}

const Magnetic: React.FC<MagneticProps> = ({ children, strength = 0.5, tilt = 15, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Center point of the element
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Distance from center (-1 to 1 normalized roughly)
    const normX = (clientX - centerX) / (width / 2);
    const normY = (clientY - centerY) / (height / 2);

    // Calculate movement
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    
    // Calculate 3D Tilt (Inverse of mouse movement to look "at" the cursor)
    const rotateY = normX * tilt;  // Tilt left/right
    const rotateX = -normY * tilt; // Tilt up/down (inverted)
    
    setPosition({ x, y, rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `
          translate3d(${position.x}px, ${position.y}px, 0) 
          rotateX(${position.rotateX}deg) 
          rotateY(${position.rotateY}deg)
          perspective(1000px)
        `,
      }}
      className={`transition-transform duration-200 ease-out will-change-transform inline-block ${className}`}
    >
      {React.cloneElement(children)}
    </div>
  );
};

export default Magnetic;