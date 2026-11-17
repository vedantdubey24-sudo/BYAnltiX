import React, { useState, useEffect, useCallback } from 'react';

interface GlitchHeadingProps {
  text: string;
  className?: string;
  isOutlined?: boolean;
}

const GLYPHS = '01#_/-[]{}<>*+=~ΔΣΩ¥$';

export const GlitchHeading: React.FC<GlitchHeadingProps> = ({
  text,
  className = '',
  isOutlined = false,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    let frames = 0;
    const maxFrames = 7;

    const interval = setInterval(() => {
      frames++;
      if (frames >= maxFrames) {
        clearInterval(interval);
        setDisplayText(text);
        setIsGlitching(false);
      } else {
        // Randomly scramble 1-3 characters
        const chars = text.split('');
        const scrambleCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < scrambleCount; i++) {
          const randIdx = Math.floor(Math.random() * chars.length);
          chars[randIdx] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplayText(chars.join(''));
      }
    }, 45);
  }, [text]);

  // Periodic autonomous glitch burst every 2.8 - 4.2 seconds (matching Axevia reference video)
  useEffect(() => {
    const scheduleNextGlitch = () => {
      const delay = 2600 + Math.random() * 1600;
      return setTimeout(() => {
        triggerGlitch();
        timer = scheduleNextGlitch();
      }, delay);
    };

    let timer = scheduleNextGlitch();
    return () => clearTimeout(timer);
  }, [triggerGlitch]);

  return (
    <div
      onMouseEnter={triggerGlitch}
      className={`relative inline-block cursor-pointer select-none ${className} ${
        isGlitching ? 'glitch-active' : ''
      }`}
      data-text={text}
    >
      {/* Base Text Layer */}
      <span
        className={`relative z-10 transition-colors duration-150 ${
          isOutlined ? 'font-outline' : 'text-white'
        }`}
      >
        {displayText}
      </span>

      {/* Sliced Cyan Glitch Displacement Layer (Active during glitch) */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 z-20 pointer-events-none ${
          isOutlined ? 'font-outline text-transparent' : 'text-white'
        } glitch-slice-cyan ${isGlitching ? 'opacity-100' : 'opacity-0'}`}
      >
        {displayText}
      </span>

      {/* Sliced Magenta/Red Glitch Displacement Layer (Active during glitch) */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 z-20 pointer-events-none ${
          isOutlined ? 'font-outline text-transparent' : 'text-white'
        } glitch-slice-magenta ${isGlitching ? 'opacity-100' : 'opacity-0'}`}
      >
        {displayText}
      </span>
    </div>
  );
};
