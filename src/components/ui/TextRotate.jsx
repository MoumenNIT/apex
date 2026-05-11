import { useState, useEffect } from 'react';

const TextRotate = ({
  texts,
  rotationInterval = 2500,
  className = '',
  transitionDuration = 0.5,
  staggerDuration = 0.03,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsAnimating(false);
      }, transitionDuration * 1000);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [texts.length, rotationInterval, transitionDuration]);

  const currentText = texts[currentIndex];

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {currentText.split('').map((char, index) => (
        <span
          key={`${currentIndex}-${index}`}
          className="inline-block"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating 
              ? 'translateY(-100%) rotateX(-90deg)' 
              : 'translateY(0) rotateX(0)',
            transition: `all ${transitionDuration}s ease ${index * staggerDuration}s`,
            transformOrigin: 'center bottom',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default TextRotate;
