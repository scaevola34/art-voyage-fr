interface UrbanoMapLogoProps {
  className?: string;
  size?: number;
}

/**
 * Urbanomap logo - Interconnected map nodes forming urban flow
 * Represents navigation, ecosystem, and street art energy
 */
export const UrbanoMapLogo = ({ className = "", size = 40 }: UrbanoMapLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo Urbanomap - Réseau interconnecté de lieux street art"
    >
      <title>Logo Urbanomap</title>
      {/* Central map pin with urban flow */}
      <g>
        {/* Connection routes - organic network */}
        <path
          d="M50 25 L30 35 M50 25 L70 35 M30 35 L25 55 M70 35 L75 55 M25 55 L35 75 M75 55 L65 75 M35 75 L50 85 M65 75 L50 85"
          stroke="#00ff88"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        
        {/* Network nodes */}
        <circle cx="50" cy="25" r="4" fill="#00ff88" />
        <circle cx="30" cy="35" r="3" fill="#00ff88" opacity="0.7" />
        <circle cx="70" cy="35" r="3" fill="#00ff88" opacity="0.7" />
        <circle cx="25" cy="55" r="2.5" fill="#00ff88" opacity="0.5" />
        <circle cx="75" cy="55" r="2.5" fill="#00ff88" opacity="0.5" />
        <circle cx="35" cy="75" r="3" fill="#00ff88" opacity="0.6" />
        <circle cx="65" cy="75" r="3" fill="#00ff88" opacity="0.6" />
        <circle cx="50" cy="85" r="3.5" fill="#00ff88" opacity="0.8" />
        
        {/* Central pin shape with stencil edge */}
        <path
          d="M50 30 C40 30 35 38 35 46 C35 56 50 70 50 70 C50 70 65 56 65 46 C65 38 60 30 50 30Z"
          fill="#00ff88"
          stroke="#0a0a0a"
          strokeWidth="1.5"
        />
        
        {/* Inner pin circle */}
        <circle cx="50" cy="45" r="6" fill="#0a0a0a" />
        
        {/* Pin accent dot */}
        <circle cx="50" cy="45" r="2.5" fill="#00ff88" />
        
        {/* Spray texture accent - urban edge */}
        <circle cx="58" cy="38" r="1.5" fill="#00ff88" opacity="0.3" />
        <circle cx="42" cy="52" r="1" fill="#00ff88" opacity="0.3" />
      </g>
    </svg>
  );
};

/**
 * Simplified favicon version (32x32)
 */
export const UrbanoMapFavicon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Favicon Urbanomap"
    >
      <title>Favicon Urbanomap</title>
      {/* Simplified pin with network */}
      <circle cx="16" cy="8" r="2" fill="#00ff88" />
      <path
        d="M16 10 C12 10 10 13 10 16 C10 20 16 26 16 26 C16 26 22 20 22 16 C22 13 20 10 16 10Z"
        fill="#00ff88"
      />
      <circle cx="16" cy="16" r="3" fill="#0a0a0a" />
      <circle cx="8" cy="12" r="1.5" fill="#00ff88" opacity="0.5" />
      <circle cx="24" cy="12" r="1.5" fill="#00ff88" opacity="0.5" />
    </svg>
  );
};
