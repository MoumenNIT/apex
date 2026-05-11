const GradientText = ({
  children,
  className = '',
  color = '#e63946',
  animate = true,
  animationDuration = 3,
}) => {
  return (
    <span
      className={className}
      style={{
        color: color,
        fontWeight: '700',
        animation: animate 
          ? `colorShift ${animationDuration}s ease infinite` 
          : 'none',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes colorShift {
          0%, 100% { color: ${color}; }
          50% { color: ${color}99; }
        }
      `}</style>
      {children}
    </span>
  );
};

export default GradientText;
