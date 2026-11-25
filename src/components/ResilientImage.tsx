import React, { useState } from 'react';
import { ReliefEmblem } from './ReliefLogo';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel = 'Relief Paysage',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#163B29] via-[#0E281B] to-[#091B12] text-[#EBD9B3] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ReliefEmblem className="w-12 h-12 mb-3 opacity-80" />
        <span className="font-serif text-sm tracking-wide text-center opacity-85">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
