import { useState } from 'react';

const AnimatedCard = ({
  children,
  className = '',
  hoverScale = 1.02,
  hoverElevation = 20,
  glowColor = 'rgba(230, 57, 70, 0.3)',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
        boxShadow: isHovered 
          ? `0 ${hoverElevation}px ${hoverElevation * 2}px ${glowColor}`
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        willChange: 'transform, box-shadow',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
