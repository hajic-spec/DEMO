import React from 'react';

interface ReliefEmblemProps {
  className?: string;
}

export const ReliefEmblem: React.FC<ReliefEmblemProps> = ({ className = 'w-10 h-10' }) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M26 98C12 78 14 44 40 28C63 14 96 20 107 46"
      stroke="#C69D53"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M26 98C13 78 15 47 41 29"
      stroke="#5A7D2C"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path d="M41 29C35 19 25 14 14 14C20 25 30 30 41 29Z" fill="#4E7324" />
    <path d="M41 29C45 17 55 10 66 9C60 20 51 27 41 29Z" fill="#3B5B1B" />
    <path d="M35 35C24 31 15 34 8 42C19 46 29 43 35 35Z" fill="#5F872D" />
    <path d="M47 26C56 26 65 23 73 17C64 14 54 17 47 26Z" fill="#4E7324" />
    <ellipse
      cx="37"
      cy="46"
      rx="5.5"
      ry="7.8"
      transform="rotate(-18 37 46)"
      fill="#899F24"
    />
    <ellipse
      cx="47"
      cy="42"
      rx="5.2"
      ry="7.5"
      transform="rotate(24 47 42)"
      fill="#788E1E"
    />
  </svg>
);

export const ReliefCrestSvg: React.FC<{ className?: string }> = ({
  className = 'w-64 mx-auto',
}) => (
  <svg
    className={className}
    viewBox="0 0 320 225"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Blason officiel Relief Paysage"
  >
    <path
      d="M56 172C30 129 38 66 95 36C149 8 235 22 265 72"
      stroke="#B5893A"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M56 172C31 129 38 68 96 36"
      stroke="#537925"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path d="M95 36C82 16 61 7 38 9C51 29 72 38 95 36Z" fill="#4B7221" />
    <path d="M96 36C105 14 126 1 151 0C138 22 119 34 96 36Z" fill="#355516" />
    <path d="M80 48C58 40 39 45 24 60C46 68 66 63 80 48Z" fill="#5D872B" />
    <path d="M111 30C129 31 148 25 163 13C145 8 126 14 111 30Z" fill="#4B7221" />
    <ellipse
      cx="86"
      cy="68"
      rx="10"
      ry="14"
      transform="rotate(-18 86 68)"
      fill="#8CA323"
    />
    <ellipse
      cx="107"
      cy="61"
      rx="9.5"
      ry="13.5"
      transform="rotate(25 107 61)"
      fill="#7A911D"
    />
    <text
      x="165"
      y="126"
      textAnchor="middle"
      fontFamily="'Cormorant Garamond', Georgia, serif"
      fontSize="48"
      fontWeight="700"
      letterSpacing="3"
      fill="#0E281B"
    >
      RELIEF
    </text>
    <text
      x="165"
      y="170"
      textAnchor="middle"
      fontFamily="'Cormorant Garamond', Georgia, serif"
      fontSize="44"
      fontWeight="600"
      letterSpacing="2"
      fill="#B5893A"
    >
      PAYSAGE
    </text>
    <text
      x="165"
      y="202"
      textAnchor="middle"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontSize="11.5"
      fontWeight="600"
      letterSpacing="3"
      fill="#0E281B"
    >
      CRÉATION · ENTRETIEN · ÉLAGAGE
    </text>
  </svg>
);
