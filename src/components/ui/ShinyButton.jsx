import { useState } from 'react';

const ShinyButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: disabled ? '#333' : '#e63946',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Shine effect */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3) 0%, transparent 50%)`
            : 'none',
          transition: 'opacity 0.3s ease',
          opacity: isHovered ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* Border glow */}
      <span
        style={{
          position: 'absolute',
          inset: '-2px',
          background: '#e63946',
          borderRadius: '10px',
          zIndex: -1,
          opacity: isHovered ? 0.3 : 0,
          filter: 'blur(8px)',
          transition: 'opacity 0.3s ease',
        }}
      />
      
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
};

export default ShinyButton;
