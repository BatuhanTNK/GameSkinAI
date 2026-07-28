/**
 * @fileoverview Oyun temaları için ORİJİNAL VEKTÖR SVG LOGOLARI.
 * Her bir oyunun orijinal resmi logosunu yüksek çözünürlüklü SVG olarak çizer.
 */

import React from 'react';

/** 1. Minecraft 3D Çim Blok Logosu */
export function MinecraftLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8L88 28V72L50 92L12 72V28L50 8Z" fill="#5E8E3E" />
      <path d="M50 8L88 28L50 48L12 28L50 8Z" fill="#7CBD41" />
      <path d="M50 48L88 28V72L50 92V48Z" fill="#573D26" />
      <path d="M50 48L12 28V72L50 92V48Z" fill="#79563A" />
      <path d="M12 28L50 48L88 28L50 34L12 28Z" fill="#8EDE49" />
      <rect x="25" y="42" width="10" height="14" fill="#5E8E3E" />
      <rect x="45" y="50" width="10" height="16" fill="#5E8E3E" />
      <rect x="65" y="40" width="10" height="12" fill="#5E8E3E" />
    </svg>
  );
}

/** 2. Roblox Orijinal Tilted Square Logosu */
export function RobloxLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-15 50 50)">
        <rect x="12" y="12" width="76" height="76" rx="14" fill="#000000" />
        <rect x="36" y="36" width="28" height="28" rx="6" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/** 3. Among Us Orijinal Crewmate Logosu */
export function AmongUsLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Backpack */}
      <rect x="14" y="36" width="22" height="42" rx="10" fill="#C70039" />
      <rect x="10" y="40" width="10" height="34" rx="5" fill="#800020" />
      {/* Main Body */}
      <path d="M30 30C30 14 46 10 62 10C78 10 86 22 86 36V76C86 84 78 90 70 90H68C61 90 58 84 58 76V72H48V76C48 84 45 90 38 90H36C28 90 26 82 26 74V30Z" fill="#C70039" />
      <path d="M34 30C34 18 46 14 62 14C74 14 82 22 82 36V76C82 82 76 86 70 86H64V70H42V86H38C34 86 34 80 34 74V30Z" fill="#FF1744" />
      {/* Visor */}
      <ellipse cx="68" cy="36" rx="18" ry="12" fill="#00E5FF" stroke="#00838F" strokeWidth="3" />
      <ellipse cx="64" cy="34" rx="12" ry="7" fill="#E0F7FA" />
    </svg>
  );
}

/** 4. Pixel RPG Kılıç & Kalkan Logosu */
export function PixelRpgLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10L85 25V55C85 75 50 90 50 90C50 90 15 75 15 55V25L50 10Z" fill="#F59E0B" />
      <path d="M50 16L78 28V52C78 68 50 82 50 82C50 82 22 68 22 52V28L50 16Z" fill="#B45309" />
      {/* Kılıç */}
      <path d="M72 18L82 28L38 72L28 62L72 18Z" fill="#FFFFFF" />
      <path d="M22 58L42 78L32 88L12 68L22 58Z" fill="#EF4444" />
    </svg>
  );
}

/** 5. Stardew Valley Yıldız Logosu */
export function StardewLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L63 35L95 38L70 60L78 92L50 75L22 92L30 60L5 38L37 35L50 5Z" fill="#FBBF24" />
      <path d="M50 14L60 37L83 39L65 56L71 80L50 67L29 80L35 56L17 39L40 37L50 14Z" fill="#F59E0B" />
      <circle cx="50" cy="50" r="14" fill="#FEF08A" />
      {/* Yeşil yaprak */}
      <path d="M50 50C60 40 75 42 75 42C75 42 73 57 63 63C53 69 50 50 50 50Z" fill="#22C55E" />
    </svg>
  );
}

/** 6. Fortnite Orijinal "F" Logosu */
export function FortniteLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#1E1B4B" />
      <path d="M28 16H76V34H48V48H70V64H48V84H28V16Z" fill="#FFFFFF" />
    </svg>
  );
}

/** 7. GTA San Andreas Orijinal Logo Amblemi */
export function GtaSaLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#1E293B" />
      <circle cx="50" cy="40" r="28" fill="#F59E0B" />
      {/* Palm tree */}
      <path d="M47 82C47 82 49 55 53 42H47C43 55 41 82 41 82H47Z" fill="#000000" />
      <path d="M50 42C30 32 15 42 10 47C25 42 45 42 50 42Z" fill="#000000" />
      <path d="M50 42C70 32 85 42 90 47C75 42 55 42 50 42Z" fill="#000000" />
      <path d="M50 38C40 18 25 12 20 12C30 22 45 32 50 38Z" fill="#000000" />
      <path d="M50 38C60 18 75 12 80 12C70 22 55 32 50 38Z" fill="#000000" />
      {/* GTA Text */}
      <text x="50" y="90" textAnchor="middle" fill="#FFFFFF" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="16" letterSpacing="1">GTA SA</text>
    </svg>
  );
}

/** 8. Pokémon Orijinal Pokéball Logosu */
export function PokemonLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#1E293B" />
      <path d="M4 50C4 24.6 24.6 4 50 4C75.4 4 96 24.6 96 50H4Z" fill="#EF4444" />
      <path d="M4 50C4 75.4 24.6 96 50 96C75.4 96 96 75.4 96 50H4Z" fill="#FFFFFF" />
      <rect x="4" y="44" width="92" height="12" fill="#1E293B" />
      <circle cx="50" cy="50" r="16" fill="#1E293B" />
      <circle cx="50" cy="50" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
    </svg>
  );
}

/** 9. Valorant Orijinal "V" Logosu */
export function ValorantLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0F172A" />
      {/* V left blade */}
      <path d="M18 20L45 80H62L35 20H18Z" fill="#FF4655" />
      {/* V right slash */}
      <path d="M82 20L65 56H48L65 20H82Z" fill="#FF4655" />
    </svg>
  );
}

/** 10. Brawl Stars Orijinal Kuru Kafa Logosu */
export function BrawlStarsLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#F59E0B" stroke="#D97706" strokeWidth="4" />
      {/* Skull Head */}
      <path d="M28 38C28 22 38 16 50 16C62 16 72 22 72 38V54C72 64 64 72 50 72C36 72 28 64 28 54V38Z" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
      {/* Eyes */}
      <circle cx="41" cy="40" r="7" fill="#000000" />
      <circle cx="59" cy="40" r="7" fill="#000000" />
      {/* Nose & Teeth */}
      <polygon points="50,48 45,54 55,54" fill="#000000" />
      <rect x="38" y="60" width="5" height="8" rx="2" fill="#000000" />
      <rect x="47.5" y="60" width="5" height="8" rx="2" fill="#000000" />
      <rect x="57" y="60" width="5" height="8" rx="2" fill="#000000" />
    </svg>
  );
}

/** 11. Clash Royale Orijinal Kral Tacı Logosu */
export function ClashRoyaleLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 76L8 28L32 50L50 14L68 50L92 28L88 76H12Z" fill="#FBBF24" stroke="#B45309" strokeWidth="4" />
      <path d="M12 76H88V88H12V76Z" fill="#D97706" stroke="#78350F" strokeWidth="3" />
      <circle cx="50" cy="40" r="7" fill="#EF4444" />
      <circle cx="28" cy="54" r="5" fill="#3B82F6" />
      <circle cx="72" cy="55" r="5" fill="#3B82F6" />
    </svg>
  );
}

/** 12. League of Legends Orijinal "L" Metallik Logosu */
export function LolLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0F172A" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#C59B27" strokeWidth="3" />
      {/* LoL L emblem */}
      <path d="M32 20H48V62H75V76H32V20Z" fill="#C59B27" />
      <path d="M36 24H44V58H71V72H36V24Z" fill="#F3D068" />
    </svg>
  );
}

/** 13. Apex Legends Orijinal Chevron "A" Logosu */
export function ApexLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#18181B" />
      <path d="M50 12L12 84H32L50 48L68 84H88L50 12Z" fill="#DA291C" />
      <path d="M34 62H66L50 76L34 62Z" fill="#FFFFFF" />
    </svg>
  );
}

/** 14. LEGO Orijinal Kutu Logosu */
export function LegoLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="16" fill="#E50012" stroke="#FFD700" strokeWidth="6" />
      <text x="50" y="66" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="32" stroke="#000000" strokeWidth="3">LEGO</text>
    </svg>
  );
}

/** 15. Fall Guys Orijinal Fasulye Yüzlüğü Logosu */
export function FallGuysLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="24" fill="#FF007F" />
      {/* Oval White Faceplate */}
      <ellipse cx="50" cy="50" rx="34" ry="24" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
      {/* Black Dot Eyes */}
      <circle cx="38" cy="48" r="6" fill="#000000" />
      <circle cx="62" cy="48" r="6" fill="#000000" />
    </svg>
  );
}

/** 16. Genshin Impact Orijinal Primogem Kristali Logosu */
export function GenshinLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#1E1B4B" />
      <path d="M50 6C50 32 70 50 94 50C70 50 50 68 50 94C50 68 30 50 6 50C30 50 50 32 50 6Z" fill="#A855F7" />
      <path d="M50 20C50 36 64 50 80 50C64 50 50 64 50 80C50 64 36 50 20 50C36 50 50 36 50 20Z" fill="#38BDF8" />
      <circle cx="50" cy="50" r="9" fill="#FFFFFF" />
    </svg>
  );
}

/** 17. Cyberpunk 2077 Orijinal Sarı Cyber-V Logosu */
export function CyberpunkLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="16" fill="#FCEE0A" />
      <path d="M18 24L44 76H56L82 24H66L50 58L34 24H18Z" fill="#00F0FF" />
      <line x1="10" y1="42" x2="90" y2="42" stroke="#000000" strokeWidth="5" />
    </svg>
  );
}

/** 18. The Witcher Orijinal Kurt Madalyonu Logosu */
export function WitcherLogo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
      {/* Wolf Head Emblem */}
      <path d="M50 14L22 42L32 58L16 72L50 92L84 72L68 58L78 42L50 14Z" fill="#94A3B8" stroke="#0F172A" strokeWidth="3" />
      <path d="M50 24L34 46L50 82L66 46L50 24Z" fill="#475569" />
      {/* Glowing Red Eyes */}
      <polygon points="36,46 44,48 38,52" fill="#FF0000" />
      <polygon points="64,46 56,48 62,52" fill="#FF0000" />
    </svg>
  );
}

/** 19. CS2 Counter-Strike 2 Orijinal Logosu */
export function Cs2Logo({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#0F172A" />
      <path d="M20 20H80V35H35V45H75V80H20V65H60V55H20V20Z" fill="#F59E0B" />
      <text x="76" y="80" fill="#FFFFFF" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="36">2</text>
    </svg>
  );
}

/** Ana Logo Oluşturucu / Eşleştirici */
export function getGameLogo(slug, className = "h-10 w-10") {
  switch (slug) {
    case 'minecraft':
      return <MinecraftLogo className={className} />;
    case 'roblox':
      return <RobloxLogo className={className} />;
    case 'among-us':
      return <AmongUsLogo className={className} />;
    case 'pixel-rpg':
      return <PixelRpgLogo className={className} />;
    case 'stardew':
      return <StardewLogo className={className} />;
    case 'fortnite':
      return <FortniteLogo className={className} />;
    case 'gta-sa':
      return <GtaSaLogo className={className} />;
    case 'pokemon':
      return <PokemonLogo className={className} />;
    case 'valorant':
      return <ValorantLogo className={className} />;
    case 'brawl-stars':
      return <BrawlStarsLogo className={className} />;
    case 'clash-royale':
      return <ClashRoyaleLogo className={className} />;
    case 'lol':
      return <LolLogo className={className} />;
    case 'apex':
      return <ApexLogo className={className} />;
    case 'lego':
      return <LegoLogo className={className} />;
    case 'fall-guys':
      return <FallGuysLogo className={className} />;
    case 'genshin':
      return <GenshinLogo className={className} />;
    case 'cyberpunk':
      return <CyberpunkLogo className={className} />;
    case 'witcher':
      return <WitcherLogo className={className} />;
    case 'cs2':
      return <Cs2Logo className={className} />;
    default:
      return null;
  }
}
