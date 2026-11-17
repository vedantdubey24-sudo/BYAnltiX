import React from 'react';

interface HeroOverlayProps {
  scrollProgress: number; // 0 to 1
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ scrollProgress }) => {
  // Fade out hero text quickly as user starts scrolling down
  const opacity = Math.max(0, 1 - scrollProgress * 5.0);
  const translateY = scrollProgress * -50;

  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-start items-start p-8 sm:p-12 md:p-16 transition-all duration-300"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div className="flex flex-col items-start text-left select-none max-w-2xl">
        {/* Large Brand Heading in Left Corner */}
        <h1 className="font-space font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] tracking-[0.025em] text-white leading-[0.95] drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
          BYAnltiX
        </h1>

        {/* Tagline */}
        <p className="font-sora font-light text-lg sm:text-xl md:text-2xl tracking-[0.025em] text-[#D9DADD] mt-3 sm:mt-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          Where Data Reveals Its Insights.
        </p>
      </div>
    </div>
  );
};
