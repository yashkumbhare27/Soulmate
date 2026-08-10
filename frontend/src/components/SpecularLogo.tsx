import React from 'react';

interface SpecularLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const SpecularLogo: React.FC<SpecularLogoProps> = ({
  size = 120,
  showText = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg filter"
      >
        <defs>
          {/* Metallic gradient for Left Ribbon */}
          <linearGradient id="leftRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="30%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#E8A0BF" /> {/* Rose gold reflection */}
            <stop offset="70%" stopColor="#8B5FBF" /> {/* Lavender reflection */}
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Metallic gradient for Right Ribbon */}
          <linearGradient id="rightRibbonGrad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="30%" stopColor="#CBD5E1" />
            <stop offset="55%" stopColor="#8B5FBF" />
            <stop offset="75%" stopColor="#E8A0BF" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* AI node glow effect */}
          <filter id="logoGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Shadows for ribbons overlap */}
          <filter id="ribbonShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0F0B13" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Left Ribbon (Curving Ribbon Metaphor) */}
        <path
          d="M 70 180 C 50 100, 115 50, 145 110 C 152 125, 157 145, 160 165"
          stroke="url(#leftRibbonGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
          filter="url(#ribbonShadow)"
        />
        {/* Left Highlight */}
        <path
          d="M 72 178 C 52 98, 113 52, 143 108"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Right Ribbon (Curving Ribbon Metaphor) */}
        <path
          d="M 230 120 C 250 200, 185 250, 155 190 C 148 175, 143 155, 140 135"
          stroke="url(#rightRibbonGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
          filter="url(#ribbonShadow)"
        />
        {/* Right Highlight */}
        <path
          d="M 228 122 C 248 202, 183 252, 153 192"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Central Glowing Node Cluster (the "AI" meeting point spark) */}
        <g filter="url(#logoGlow)">
          <line x1="135" y1="135" x2="150" y2="150" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="150" y1="150" x2="165" y2="165" stroke="#14B8A6" strokeWidth="1.5" />
          <line x1="165" y1="165" x2="140" y2="175" stroke="#8B5FBF" strokeWidth="1.5" />
          <line x1="140" y1="175" x2="135" y2="135" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="150" y1="150" x2="140" y2="175" stroke="#14B8A6" strokeWidth="1.5" />

          <circle cx="135" cy="135" r="5.5" fill="#F59E0B" />
          <circle cx="150" cy="150" r="7.5" fill="#14B8A6" />
          <circle cx="165" cy="165" r="5.5" fill="#8B5FBF" />
          <circle cx="140" cy="175" r="4.5" fill="#F59E0B" />
        </g>
      </svg>

      {showText && (
        <div className="mt-4 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-brand-gradient">
            SoulMate AI
          </h1>
          <p className="mt-1 text-xs tracking-widest text-[#E8A0BF] uppercase font-semibold">
            The only matchmaking AI that tells you why
          </p>
        </div>
      )}
    </div>
  );
};
export default SpecularLogo;
