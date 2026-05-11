import { useState, useRef } from 'react';

const TiltCard = ({
  children,
  className = '',
  tiltAmount = 10,
  scale = 1.02,
  perspective = 1000,
}) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -tiltAmount;
    const rotateY = (mouseX / (rect.width / 2)) * tiltAmount;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          transform: `
            rotateX(${tilt.x}deg) 
            rotateY(${tilt.y}deg) 
            scale(${isHovered ? scale : 1})
          `,
          transition: isHovered ? 'none' : 'transform 0.5s ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
        
        {/* Shine overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(
              ${135 + tilt.y * 2}deg, 
              rgba(255,255,255,${isHovered ? 0.1 : 0}) 0%, 
              transparent 50%
            )`,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            opacity: isHovered ? 1 : 0,
            borderRadius: 'inherit',
          }}
        />
      </div>
    </div>
  );
};

export default TiltCard;
