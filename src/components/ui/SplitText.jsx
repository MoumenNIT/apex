import { useState, useEffect, useRef } from 'react';

const SplitText = ({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  duration = 0.6,
  once = true,
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split('').map((char, charIndex) => {
            const globalIndex = words
              .slice(0, wordIndex)
              .reduce((acc, w) => acc + w.length, 0) + charIndex;
            
            return (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible 
                    ? 'translateY(0) rotateX(0)' 
                    : 'translateY(100%) rotateX(-90deg)',
                  transition: `all ${duration}s ease ${delay + globalIndex * staggerDelay}s`,
                  transformOrigin: 'center bottom',
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
