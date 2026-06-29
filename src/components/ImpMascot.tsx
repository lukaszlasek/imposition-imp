interface ImpMascotProps {
  className?: string
  width?: number
}

/**
 * Imp mascot — punk imp creature with bat wings, heavy halftone dither.
 * Palette: black (#000), risograph red (#C8103C), paper (#FAF7F2).
 * Dither: ordered halftone dot patterns (25 / 50 / 75 / 90% coverage).
 */
export function ImpMascot({ className, width = 260 }: ImpMascotProps) {
  return (
    <svg
      viewBox="0 0 260 220"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Imp mascot — punk imp creature with bat wings holding a zine"
      role="img"
    >
      <defs>
        {/*
         * Ordered halftone patterns — dots only, no background fill.
         * The page's paper color (#FAF7F2) shows through between dots.
         * Coverage: dot_area / cell_area = π·r² / w²
         */}

        {/* ~14% — sparse dots, lots of paper (highlight zones) */}
        <pattern id="imp-d25" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3" fill="#000" />
        </pattern>

        {/* ~48% — medium halftone (mid-tones, wing membrane) */}
        <pattern id="imp-d50" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="3.4" fill="#000" />
        </pattern>

        {/* ~71% — dense halftone (shadow areas) */}
        <pattern id="imp-d75" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="3.8" fill="#000" />
        </pattern>

        {/* ~140% — overlapping dots → solid with tiny corner holes (darkest zones) */}
        <pattern id="imp-d90" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="4" fill="#000" />
        </pattern>

        {/* Red halftone for wing shadow / accent areas */}
        <pattern id="imp-dred" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="3.4" fill="#C8103C" />
        </pattern>
      </defs>

      {/* ── LEFT WING ──────────────────────────────────────────────── */}
      {/* Membrane — 3-scallop bottom edge, smooth top arc */}
      <path
        d="M 102,148
           Q 58,128 12,110
           Q 36,142 46,156
           Q 58,166 72,172
           Q 83,176 96,178
           Z"
        fill="url(#imp-d50)"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Wing bones / finger struts */}
      <line x1="102" y1="148" x2="12"  y2="110" stroke="#000" strokeWidth="2.5" />
      <line x1="102" y1="148" x2="34"  y2="104" stroke="#000" strokeWidth="1.8" />
      <line x1="102" y1="148" x2="20"  y2="126" stroke="#000" strokeWidth="1.8" />
      <line x1="102" y1="148" x2="48"  y2="150" stroke="#000" strokeWidth="1.8" />
      {/* Shadow dither at wing root — denser where it meets body */}
      <ellipse cx="80" cy="158" rx="22" ry="12" fill="url(#imp-d75)" opacity="0.55" />

      {/* ── RIGHT WING ─────────────────────────────────────────────── */}
      <path
        d="M 158,148
           Q 202,128 248,110
           Q 224,142 214,156
           Q 202,166 188,172
           Q 177,176 164,178
           Z"
        fill="url(#imp-d50)"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="158" y1="148" x2="248" y2="110" stroke="#000" strokeWidth="2.5" />
      <line x1="158" y1="148" x2="226" y2="104" stroke="#000" strokeWidth="1.8" />
      <line x1="158" y1="148" x2="240" y2="126" stroke="#000" strokeWidth="1.8" />
      <line x1="158" y1="148" x2="212" y2="150" stroke="#000" strokeWidth="1.8" />
      <ellipse cx="180" cy="158" rx="22" ry="12" fill="url(#imp-d75)" opacity="0.55" />

      {/* ── TAIL ───────────────────────────────────────────────────── */}
      <path
        d="M 153,168 Q 178,156 178,178 Q 178,196 162,193"
        fill="none"
        stroke="#000"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Red diamond tip */}
      <polygon points="162,193 155,185 162,176 169,185" fill="#C8103C" stroke="#000" strokeWidth="1.5" />

      {/* ── ARMS ───────────────────────────────────────────────────── */}
      <line x1="102" y1="156" x2="78"  y2="175" stroke="#000" strokeWidth="9"  strokeLinecap="round" />
      <line x1="158" y1="156" x2="182" y2="140" stroke="#000" strokeWidth="9"  strokeLinecap="round" />
      {/* Right fist */}
      <circle cx="185" cy="137" r="7" fill="url(#imp-d90)" stroke="#000" strokeWidth="2" />

      {/* ── ZINE in left hand ──────────────────────────────────────── */}
      <rect x="64" y="173" width="23" height="17" rx="1" fill="#C8103C" stroke="#000" strokeWidth="2" />
      <line x1="75"  y1="173" x2="75"  y2="190" stroke="#000" strokeWidth="1.5" />
      <line x1="65"  y1="178" x2="73"  y2="178" stroke="#000" strokeWidth="1"   opacity="0.65" />
      <line x1="65"  y1="182" x2="73"  y2="182" stroke="#000" strokeWidth="1"   opacity="0.65" />
      <line x1="65"  y1="186" x2="73"  y2="186" stroke="#000" strokeWidth="1"   opacity="0.65" />

      {/* ── LEGS ───────────────────────────────────────────────────── */}
      <line x1="119" y1="182" x2="112" y2="210" stroke="#000" strokeWidth="11" strokeLinecap="round" />
      <line x1="141" y1="182" x2="148" y2="210" stroke="#000" strokeWidth="11" strokeLinecap="round" />

      {/* ── BODY ───────────────────────────────────────────────────── */}
      {/* Dark halftone base */}
      <ellipse cx="130" cy="156" rx="28" ry="26" fill="url(#imp-d90)" stroke="#000" strokeWidth="3" />
      {/* Highlight zone — lighter dither upper-left of body */}
      <ellipse cx="120" cy="146" rx="14" ry="12" fill="url(#imp-d25)" />
      {/* Shadow zone — denser dither lower-right */}
      <ellipse cx="140" cy="166" rx="12" ry="10" fill="url(#imp-d75)" opacity="0.6" />

      {/* ── FEET ───────────────────────────────────────────────────── */}
      <ellipse cx="109" cy="213" rx="11" ry="5"  fill="url(#imp-d90)" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="151" cy="213" rx="11" ry="5"  fill="url(#imp-d90)" stroke="#000" strokeWidth="1.5" />

      {/* ── HORNS (behind head, red with dither shadow) ────────────── */}
      <polygon points="108,118 121,114 104,78" fill="#C8103C" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Horn shadow dither */}
      <polygon points="110,118 121,116 106,84" fill="url(#imp-d50)" opacity="0.35" />

      <polygon points="139,114 152,118 156,78" fill="#C8103C" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="139,116 150,118 154,84" fill="url(#imp-d50)" opacity="0.35" />

      {/* ── HEAD ───────────────────────────────────────────────────── */}
      {/* Main head — medium-dark halftone (not solid black, shows texture) */}
      <circle cx="130" cy="110" r="34" fill="url(#imp-d75)" stroke="#000" strokeWidth="3.5" />
      {/* Highlight zone — sparse dither upper-left (gives roundness) */}
      <ellipse cx="116" cy="98"  rx="18" ry="16" fill="url(#imp-d25)" />
      {/* Deep shadow zone — denser dither lower-right jaw */}
      <ellipse cx="143" cy="122" rx="14" ry="12" fill="url(#imp-d90)" opacity="0.5" />

      {/* ── EARS ───────────────────────────────────────────────────── */}
      <polygon points="98,120 84,104 96,140"  fill="url(#imp-d90)" stroke="#000" strokeWidth="2.5" />
      <polygon points="162,120 176,104 164,140" fill="url(#imp-d90)" stroke="#000" strokeWidth="2.5" />
      {/* Ear inner — red */}
      <polygon points="97,122 88,110 96,133" fill="#C8103C" opacity="0.55" />
      <polygon points="163,122 172,110 164,133" fill="#C8103C" opacity="0.55" />

      {/* ── EYES ───────────────────────────────────────────────────── */}
      {/* Left — squinting (mischievous) */}
      <ellipse cx="116" cy="108" rx="9.5" ry="10.5" fill="#FAF7F2" stroke="#000" strokeWidth="1.5" />
      <circle  cx="118" cy="110" r="5.5"  fill="#000" />
      <circle  cx="120" cy="107" r="2"    fill="#FAF7F2" />
      {/* Upper squint lid — heavy line cuts across the eye */}
      <path d="M 106 102 Q 116 98 126 102" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" />

      {/* Right — wide open, wild */}
      <ellipse cx="144" cy="108" rx="9.5" ry="11.5" fill="#FAF7F2" stroke="#000" strokeWidth="1.5" />
      <circle  cx="146" cy="110" r="6"    fill="#000" />
      <circle  cx="148" cy="106" r="2.2"  fill="#FAF7F2" />

      {/* ── NOSE ───────────────────────────────────────────────────── */}
      <circle cx="127" cy="121" r="2.2" fill="#FAF7F2" opacity="0.6" />
      <circle cx="133" cy="121" r="2.2" fill="#FAF7F2" opacity="0.6" />

      {/* ── MOUTH — asymmetric smirk ───────────────────────────────── */}
      <path
        d="M 118 130 Q 128 141 143 132"
        fill="none"
        stroke="#FAF7F2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Extra smirk wrinkle at right corner */}
      <path
        d="M 143 132 Q 146 128 144 124"
        fill="none"
        stroke="#FAF7F2"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── CHEEKS — risograph red halftone blush ──────────────────── */}
      <circle cx="100" cy="116" r="2.5" fill="#C8103C" opacity="0.65" />
      <circle cx="104" cy="122" r="1.8" fill="#C8103C" opacity="0.45" />
      <circle cx="160" cy="116" r="2.5" fill="#C8103C" opacity="0.65" />
      <circle cx="156" cy="122" r="1.8" fill="#C8103C" opacity="0.45" />

      {/* ── CROSSHATCH BODY DETAIL — engraving lines on torso ──────── */}
      {/* Diagonal hatch lines clipped roughly to body lower-right shadow */}
      <line x1="133" y1="162" x2="148" y2="148" stroke="#000" strokeWidth="0.8" opacity="0.4" />
      <line x1="136" y1="166" x2="152" y2="152" stroke="#000" strokeWidth="0.8" opacity="0.4" />
      <line x1="139" y1="170" x2="153" y2="157" stroke="#000" strokeWidth="0.8" opacity="0.4" />
      <line x1="141" y1="174" x2="154" y2="162" stroke="#000" strokeWidth="0.8" opacity="0.4" />
    </svg>
  )
}
