import React from 'react';

interface MarqueeBannerProps {
  text: string;
  className?: string;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ text, className = '' }) => {
  const segments = text
    .split('•')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const renderTrack = (keyPrefix: string, ariaHidden = false) => (
    <div
      key={keyPrefix}
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-6 pr-6"
    >
      {segments.map((segment, index) => (
        <React.Fragment key={`${keyPrefix}-${index}`}>
          <span className="whitespace-nowrap font-bold text-slate-800 dark:text-blue-100 text-sm md:text-base tracking-tight">
            {segment}
          </span>
          <span
            aria-hidden="true"
            className="text-blue-600 dark:text-blue-400 font-extrabold text-base select-none"
          >
            •
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl bg-blue-50/90 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/70 py-3.5 shadow-2xs ${className}`}
      role="region"
      aria-label={text}
    >
      {/* Subtle left & right fade masks for smooth entry/exit */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-blue-50 dark:from-[#0c1e3d] to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-14 bg-gradient-to-l from-blue-50 dark:from-[#0c1e3d] to-transparent z-10"
      />

      <div className="animate-marquee">
        {renderTrack('track-1')}
        {renderTrack('track-2', true)}
      </div>
    </div>
  );
};
