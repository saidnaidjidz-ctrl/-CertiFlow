export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  orientation: 'landscape' | 'portrait';
  defaultFont: 'Cinzel' | 'Playfair' | 'Inter' | 'Helvetica' | 'Times-Roman' | 'Amiri' | 'Cairo';
  defaultColor: string;
  defaultFontSize: number;
  defaultPosition: { x: number; y: number; width: number };
  svg: string; // High-resolution SVG template string (2000x1414 for landscape, 1414x2000 for portrait)
}

// 2000 x 1414 (standard A4 landscape aspect ratio ~ 1.414)
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'classic-excellence',
    name: 'Academic Excellence',
    category: 'University & Academia',
    description: 'Traditional diploma with gold ornamental border, royal seal, and formal script typography.',
    orientation: 'landscape',
    defaultFont: 'Cinzel',
    defaultColor: '#102A43',
    defaultFontSize: 44,
    defaultPosition: { x: 12, y: 50, width: 76 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" width="2000" height="1414">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE445"/>
      <stop offset="50%" stop-color="#E2BA1E"/>
      <stop offset="100%" stop-color="#C59600"/>
    </linearGradient>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#102A43"/>
      <stop offset="100%" stop-color="#0B1D30"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Parchment Background -->
  <rect width="2000" height="1414" fill="#FCFDFF"/>
  <rect x="30" y="30" width="1940" height="1354" fill="#FFFFFF" stroke="#E2EFF3" stroke-width="2"/>

  <!-- Outer Ornate Navy Border -->
  <rect x="50" y="50" width="1900" height="1314" fill="none" stroke="#102A43" stroke-width="6"/>
  <rect x="65" y="65" width="1870" height="1284" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
  <rect x="75" y="75" width="1850" height="1264" fill="none" stroke="#102A43" stroke-width="1.5" stroke-dasharray="8 6"/>

  <!-- Corner Flourishes -->
  <!-- Top Left -->
  <path d="M 50 140 C 90 140 140 90 140 50 L 120 50 C 120 80 80 120 50 120 Z" fill="url(#goldGrad)"/>
  <circle cx="100" cy="100" r="10" fill="#102A43"/>
  <!-- Top Right -->
  <path d="M 1950 140 C 1910 140 1860 90 1860 50 L 1880 50 C 1880 80 1920 120 1950 120 Z" fill="url(#goldGrad)"/>
  <circle cx="1900" cy="100" r="10" fill="#102A43"/>
  <!-- Bottom Left -->
  <path d="M 50 1274 C 90 1274 140 1324 140 1364 L 120 1364 C 120 1334 80 1294 50 1294 Z" fill="url(#goldGrad)"/>
  <circle cx="100" cy="1314" r="10" fill="#102A43"/>
  <!-- Bottom Right -->
  <path d="M 1950 1274 C 1910 1274 1860 1324 1860 1364 L 1880 1364 C 1880 1334 1920 1294 1950 1294 Z" fill="url(#goldGrad)"/>
  <circle cx="1900" cy="1314" r="10" fill="#102A43"/>

  <!-- Header Seal Crest -->
  <g transform="translate(1000, 200)" text-anchor="middle">
    <!-- Star crest -->
    <circle cx="0" cy="0" r="48" fill="#102A43" filter="url(#shadow)"/>
    <circle cx="0" cy="0" r="42" fill="none" stroke="url(#goldGrad)" stroke-width="2.5"/>
    <path d="M 0 -24 L 6 -8 L 22 -8 L 10 2 L 14 18 L 0 8 L -14 18 L -10 2 L -22 -8 L -6 -8 Z" fill="url(#goldGrad)"/>
  </g>

  <!-- Typography Hierarchy -->
  <text x="1000" y="310" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="22" font-weight="600" letter-spacing="10" fill="#00B8D9">OFFICIAL CERTIFICATION</text>
  <text x="1000" y="380" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="54" font-weight="700" letter-spacing="6" fill="#102A43">CERTIFICATE OF EXCELLENCE</text>
  
  <line x1="820" y1="410" x2="1180" y2="410" stroke="url(#goldGrad)" stroke-width="3"/>
  <circle cx="1000" cy="410" r="6" fill="#102A43"/>

  <text x="1000" y="470" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="24" font-style="italic" fill="#5A7184">This certificate is proudly conferred upon</text>

  <!-- Space for dynamic name placeholder at Y = 50% ~ 707px -->
  <line x1="450" y1="785" x2="1550" y2="785" stroke="#CBD5E1" stroke-width="1.5"/>

  <text x="1000" y="850" text-anchor="middle" font-family="'Inter', sans-serif" font-size="22" fill="#5A7184" max-width="1100">
    for outstanding academic performance, exemplary leadership, and successful completion of the curriculum.
  </text>

  <!-- Gold Seal Emblem on Bottom Left -->
  <g transform="translate(420, 1080)">
    <circle cx="0" cy="0" r="64" fill="url(#goldGrad)" filter="url(#shadow)"/>
    <circle cx="0" cy="0" r="54" fill="none" stroke="#102A43" stroke-width="2"/>
    <circle cx="0" cy="0" r="48" fill="#102A43"/>
    <text x="0" y="-8" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" font-weight="700" fill="#FCE445" letter-spacing="2">AUTHENTIC</text>
    <text x="0" y="14" text-anchor="middle" font-family="'Cinzel', serif" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="2">SEAL</text>
    <!-- Ribbon tails -->
    <path d="M -24 50 L -40 115 L 0 95 L 40 115 L 24 50 Z" fill="url(#goldGrad)" opacity="0.95"/>
  </g>

  <!-- Signatures -->
  <g transform="translate(1000, 1100)">
    <line x1="-140" y1="0" x2="140" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <path d="M -80 -18 C -50 -45 -10 -5 10 -28 C 30 -5 70 -35 85 -10" fill="none" stroke="#00B8D9" stroke-width="2.5" stroke-linecap="round"/>
    <text x="0" y="30" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#102A43">Dr. Arthur Vance</text>
    <text x="0" y="52" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#718096">Dean of Academic Affairs</text>
  </g>

  <g transform="translate(1500, 1100)">
    <line x1="-140" y1="0" x2="140" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <path d="M -70 -12 C -40 -35 0 -8 20 -24 C 45 -5 65 -30 75 -15" fill="none" stroke="#35BFA3" stroke-width="2.5" stroke-linecap="round"/>
    <text x="0" y="30" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#102A43">Elena Rostova</text>
    <text x="0" y="52" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#718096">Director of Certification</text>
  </g>

  <!-- Certificate ID Footer -->
  <text x="1000" y="1285" text-anchor="middle" font-family="'Space Mono', monospace" font-size="12" letter-spacing="3" fill="#A0AEC0">
    DOCUMENT ID: CF-2026-EXC-VERIFIED • ISSUED VIA CERTIFLOW ENGINE
  </text>
</svg>`,
  },
  {
    id: 'arabic-honor',
    name: 'شهادة شكر وتقدير (Honor & Merit)',
    category: 'الشهادات والتقدير (Arabic)',
    description: 'تصميم عربي فاخر بزخارف إسلامية ذهبية متقنة وإطار ملكي مع دعم كامل للخطوط العربية الأصيلة.',
    orientation: 'landscape',
    defaultFont: 'Amiri',
    defaultColor: '#102A43',
    defaultFontSize: 46,
    defaultPosition: { x: 12, y: 50, width: 76 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" width="2000" height="1414">
  <defs>
    <linearGradient id="arGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE445"/>
      <stop offset="50%" stop-color="#E2BA1E"/>
      <stop offset="100%" stop-color="#C59600"/>
    </linearGradient>
    <linearGradient id="arNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#102A43"/>
      <stop offset="100%" stop-color="#081827"/>
    </linearGradient>
    <filter id="arShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.16"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="2000" height="1414" fill="#FCFDFD"/>
  <rect x="35" y="35" width="1930" height="1344" fill="#FFFFFF" stroke="#E2EFF3" stroke-width="2"/>

  <!-- Ornate Islamic Borders -->
  <rect x="55" y="55" width="1890" height="1304" fill="none" stroke="#102A43" stroke-width="6"/>
  <rect x="70" y="70" width="1860" height="1274" fill="none" stroke="url(#arGold)" stroke-width="3"/>
  <rect x="82" y="82" width="1836" height="1250" fill="none" stroke="#102A43" stroke-width="1.5" stroke-dasharray="8 6"/>

  <!-- Islamic 8-Point Star Corner Motifs -->
  <!-- Top Left -->
  <g transform="translate(100, 100)">
    <rect x="-18" y="-18" width="36" height="36" fill="url(#arGold)"/>
    <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" fill="url(#arGold)"/>
    <circle cx="0" cy="0" r="8" fill="#102A43"/>
  </g>
  <!-- Top Right -->
  <g transform="translate(1900, 100)">
    <rect x="-18" y="-18" width="36" height="36" fill="url(#arGold)"/>
    <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" fill="url(#arGold)"/>
    <circle cx="0" cy="0" r="8" fill="#102A43"/>
  </g>
  <!-- Bottom Left -->
  <g transform="translate(100, 1314)">
    <rect x="-18" y="-18" width="36" height="36" fill="url(#arGold)"/>
    <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" fill="url(#arGold)"/>
    <circle cx="0" cy="0" r="8" fill="#102A43"/>
  </g>
  <!-- Bottom Right -->
  <g transform="translate(1900, 1314)">
    <rect x="-18" y="-18" width="36" height="36" fill="url(#arGold)"/>
    <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" fill="url(#arGold)"/>
    <circle cx="0" cy="0" r="8" fill="#102A43"/>
  </g>

  <!-- Islamic Geometric Medallion Crest at Top -->
  <g transform="translate(1000, 185)">
    <circle cx="0" cy="0" r="54" fill="#102A43" filter="url(#arShadow)"/>
    <circle cx="0" cy="0" r="48" fill="none" stroke="url(#arGold)" stroke-width="2.5"/>
    <rect x="-22" y="-22" width="44" height="44" fill="none" stroke="url(#arGold)" stroke-width="2"/>
    <rect x="-22" y="-22" width="44" height="44" transform="rotate(45)" fill="none" stroke="url(#arGold)" stroke-width="2"/>
    <circle cx="0" cy="0" r="8" fill="#FCE445"/>
  </g>

  <!-- Arabic Calligraphic Basmalah / Subtitle -->
  <text x="1000" y="280" text-anchor="middle" font-family="'Amiri', serif" font-size="24" font-weight="700" fill="#00B8D9">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</text>

  <!-- Certificate Title -->
  <text x="1000" y="375" text-anchor="middle" font-family="'Amiri', 'Cairo', serif" font-size="58" font-weight="700" letter-spacing="2" fill="#102A43">
    شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ
  </text>

  <!-- Gold Divider -->
  <line x1="780" y1="410" x2="1220" y2="410" stroke="url(#arGold)" stroke-width="3"/>
  <circle cx="1000" cy="410" r="6" fill="#102A43"/>
  <circle cx="780" cy="410" r="4" fill="url(#arGold)"/>
  <circle cx="1220" cy="410" r="4" fill="url(#arGold)"/>

  <text x="1000" y="475" text-anchor="middle" font-family="'Amiri', serif" font-size="28" font-style="italic" fill="#5A7184">
    تَتَشَرَّفُ الإِدَارَةُ بِمَنْحِ هَذِهِ الشَّهَادَةِ بِكُلِّ فَخْرٍ وَاعْتِزَازٍ إِلَى:
  </text>

  <!-- Name Underline (at Y = 50% ~ 707px) -->
  <line x1="450" y1="785" x2="1550" y2="785" stroke="url(#arGold)" stroke-width="2" stroke-dasharray="12 6"/>

  <text x="1000" y="865" text-anchor="middle" font-family="'Amiri', 'Cairo', serif" font-size="26" fill="#486581">
    تَقْدِيرًا لِجُهُودِهِ الْمُتَمَيِّزَةِ وَعَطَائِهِ الْكَبِيرِ وَإِتْمَامِهِ لِكَافَّةِ الْمُتَطَلَّبَاتِ بِنَجَاحٍ وَاقْتِدَارٍ
  </text>

  <!-- Royal Arabic Seal on Right Side (RTL Friendly) -->
  <g transform="translate(1580, 1070)">
    <circle cx="0" cy="0" r="66" fill="url(#arGold)" filter="url(#arShadow)"/>
    <circle cx="0" cy="0" r="56" fill="none" stroke="#102A43" stroke-width="2"/>
    <circle cx="0" cy="0" r="50" fill="#102A43"/>
    <text x="0" y="-8" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="12" font-weight="700" fill="#FCE445" letter-spacing="1">خَتْمُ الِاعْتِمَادِ</text>
    <text x="0" y="14" text-anchor="middle" font-family="'Amiri', serif" font-size="16" font-weight="800" fill="#FFFFFF">مُوَثَّقٌ</text>
    <path d="M -24 50 L -40 115 L 0 95 L 40 115 L 24 50 Z" fill="url(#arGold)" opacity="0.95"/>
  </g>

  <!-- Signatures -->
  <g transform="translate(500, 1100)">
    <line x1="-140" y1="0" x2="140" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <path d="M -70 -12 C -40 -35 0 -8 20 -24 C 45 -5 65 -30 75 -15" fill="none" stroke="#00B8D9" stroke-width="2.5" stroke-linecap="round"/>
    <text x="0" y="32" text-anchor="middle" font-family="'Amiri', 'Cairo', serif" font-size="20" font-weight="700" fill="#102A43">رَئِيسُ مَجْلِسِ الإِدَارَةِ</text>
    <text x="0" y="55" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="14" fill="#718096">الإدارة العامة والتطوير</text>
  </g>

  <g transform="translate(1040, 1100)">
    <line x1="-140" y1="0" x2="140" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <path d="M -80 -18 C -50 -45 -10 -5 10 -28 C 30 -5 70 -35 85 -10" fill="none" stroke="#35BFA3" stroke-width="2.5" stroke-linecap="round"/>
    <text x="0" y="32" text-anchor="middle" font-family="'Amiri', 'Cairo', serif" font-size="20" font-weight="700" fill="#102A43">الْمُشْرِفُ العَامُّ</text>
    <text x="0" y="55" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="14" fill="#718096">لجنة التقييم والاعتماد</text>
  </g>

  <!-- Footer ID -->
  <text x="1000" y="1285" text-anchor="middle" font-family="'Space Mono', monospace" font-size="12" letter-spacing="3" fill="#A0AEC0">
    DOCUMENT ID: CF-AR-2026-HONOR • CERTIFLOW VERIFIED CERTIFICATE
  </text>
</svg>`,
  },
  {
    id: 'modern-tech',
    name: 'Tech Hackathon & Summit',
    category: 'Hackathons & Bootcamps',
    description: 'Sleek dark cyan and deep navy tech styling with geometric accents and verified badge.',
    orientation: 'landscape',
    defaultFont: 'Inter',
    defaultColor: '#102A43',
    defaultFontSize: 42,
    defaultPosition: { x: 15, y: 52, width: 70 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" width="2000" height="1414">
  <defs>
    <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00B8D9"/>
      <stop offset="100%" stop-color="#35BFA3"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00B8D9"/>
      <stop offset="50%" stop-color="#35BFA3"/>
      <stop offset="100%" stop-color="#FCE445"/>
    </linearGradient>
  </defs>

  <rect width="2000" height="1414" fill="#F8FCFD"/>
  <rect x="40" y="40" width="1920" height="1334" rx="20" fill="#FFFFFF" stroke="#E2EFF3" stroke-width="3"/>

  <!-- Left Accent Geometric Stripe -->
  <path d="M 40 40 L 140 40 L 40 140 Z" fill="#00B8D9"/>
  <rect x="40" y="160" width="12" height="400" rx="6" fill="url(#techGrad)"/>
  <rect x="40" y="580" width="12" height="120" rx="6" fill="#FCE445"/>

  <!-- Top Right Geometric Badge -->
  <g transform="translate(1820, 100)">
    <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#102A43"/>
    <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="none" stroke="#00B8D9" stroke-width="2"/>
    <text x="0" y="6" text-anchor="middle" font-family="'Space Mono', monospace" font-size="14" font-weight="700" fill="#00B8D9">DEV</text>
  </g>

  <!-- Header -->
  <text x="180" y="240" font-family="'Space Mono', monospace" font-size="18" font-weight="700" letter-spacing="4" fill="#00B8D9">CERTIFLOW HACKATHON SERIES</text>
  <text x="180" y="320" font-family="'Plus Jakarta Sans', sans-serif" font-size="52" font-weight="800" fill="#102A43" letter-spacing="-1">
    CERTIFICATE OF INNOVATION
  </text>
  <rect x="180" y="350" width="1640" height="4" fill="url(#barGrad)"/>

  <text x="180" y="440" font-family="'Inter', sans-serif" font-size="22" font-weight="500" fill="#5A7184">
    Proudly awarded to acknowledge pioneering engineering & design excellence:
  </text>

  <!-- Name underline -->
  <line x1="180" y1="800" x2="1820" y2="800" stroke="#00B8D9" stroke-width="2" stroke-dasharray="10 6"/>

  <text x="180" y="860" font-family="'Inter', sans-serif" font-size="20" fill="#5A7184" max-width="1400">
    for building exceptional full-stack software during the 48-Hour Global Hackathon & Demo Day.
  </text>

  <!-- Bottom Badges -->
  <g transform="translate(180, 1080)">
    <rect x="0" y="0" width="220" height="70" rx="14" fill="#E8F9FC" stroke="#00B8D9" stroke-width="1.5"/>
    <text x="24" y="32" font-family="'Space Mono', monospace" font-size="12" font-weight="700" fill="#00B8D9">TRACK: AI & WEB3</text>
    <text x="24" y="52" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#102A43">FIRST PLACE</text>
  </g>

  <g transform="translate(1000, 1110)">
    <line x1="-120" y1="0" x2="120" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <text x="0" y="28" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="#102A43">Marcus Thorne</text>
    <text x="0" y="48" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" fill="#718096">Lead Architect</text>
  </g>

  <g transform="translate(1500, 1110)">
    <line x1="-120" y1="0" x2="120" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <text x="0" y="28" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="#102A43">Sarah Jenkins</text>
    <text x="0" y="48" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" fill="#718096">Judge & Tech Fellow</text>
  </g>
</svg>`,
  },
  {
    id: 'executive-mastery',
    name: 'Executive Leadership',
    category: 'Corporate & Training Centers',
    description: 'High-contrast luxury deep navy theme with gold laurel crest and corporate elegance.',
    orientation: 'landscape',
    defaultFont: 'Playfair',
    defaultColor: '#102A43',
    defaultFontSize: 46,
    defaultPosition: { x: 10, y: 48, width: 80 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" width="2000" height="1414">
  <defs>
    <linearGradient id="goldL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE445"/>
      <stop offset="100%" stop-color="#C59600"/>
    </linearGradient>
  </defs>

  <rect width="2000" height="1414" fill="#FFFFFF"/>
  
  <!-- Subtle border frame -->
  <rect x="60" y="60" width="1880" height="1294" fill="#FFFFFF" stroke="#102A43" stroke-width="2"/>
  <rect x="80" y="80" width="1840" height="1254" fill="#FAFDFE" stroke="#E2EFF3" stroke-width="1.5"/>

  <!-- Top bar -->
  <rect x="80" y="80" width="1840" height="24" fill="#102A43"/>
  <rect x="800" y="80" width="400" height="8" fill="url(#goldL)"/>

  <!-- Laurel wreath emblem -->
  <g transform="translate(1000, 240)">
    <circle cx="0" cy="0" r="44" fill="#102A43"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="url(#goldL)" stroke-width="2"/>
    <text x="0" y="8" text-anchor="middle" font-family="'Cinzel', serif" font-size="24" font-weight="700" fill="#FCE445">★</text>
  </g>

  <text x="1000" y="340" text-anchor="middle" font-family="'Cinzel', serif" font-size="20" letter-spacing="8" fill="#102A43">EXECUTIVE DEVELOPMENT INSTITUTE</text>
  <text x="1000" y="415" text-anchor="middle" font-family="'Playfair Display', serif" font-size="52" font-weight="700" fill="#102A43">Certificate of Executive Mastery</text>

  <line x1="880" y1="445" x2="1120" y2="445" stroke="url(#goldL)" stroke-width="2"/>

  <text x="1000" y="505" text-anchor="middle" font-family="'Inter', sans-serif" font-size="20" fill="#64748B">
    Presented with distinction to
  </text>

  <!-- Name space centered around 50% height -->
  <line x1="400" y1="760" x2="1600" y2="760" stroke="#E2E8F0" stroke-width="1.5"/>

  <text x="1000" y="830" text-anchor="middle" font-family="'Inter', sans-serif" font-size="22" fill="#475569" max-width="1200">
    for exemplary leadership, mastery of advanced strategic management, and high-impact organizational execution.
  </text>

  <g transform="translate(600, 1090)">
    <line x1="-130" y1="0" x2="130" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <text x="0" y="30" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#102A43">Jonathan Sterling</text>
    <text x="0" y="52" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94A3B8">Executive Chairperson</text>
  </g>

  <g transform="translate(1400, 1090)">
    <line x1="-130" y1="0" x2="130" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <text x="0" y="30" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" font-weight="600" fill="#102A43">Amara Diallo</text>
    <text x="0" y="52" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94A3B8">Chief Academic Officer</text>
  </g>
</svg>`,
  },
  {
    id: 'creative-workshop',
    name: 'Workshop & Training',
    category: 'Student Clubs & Community',
    description: 'Clean modern layout with teal and cyan accents, ideal for workshops, bootcamps, and webinars.',
    orientation: 'landscape',
    defaultFont: 'Inter',
    defaultColor: '#102A43',
    defaultFontSize: 42,
    defaultPosition: { x: 14, y: 50, width: 72 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" width="2000" height="1414">
  <defs>
    <linearGradient id="cwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#35BFA3"/>
      <stop offset="100%" stop-color="#00B8D9"/>
    </linearGradient>
  </defs>

  <rect width="2000" height="1414" fill="#FFFFFF"/>
  <rect x="50" y="50" width="1900" height="1314" rx="24" fill="#FFFFFF" stroke="#35BFA3" stroke-width="4"/>
  <rect x="64" y="64" width="1872" height="1286" rx="16" fill="none" stroke="#E2EFF3" stroke-width="1.5"/>

  <!-- Header badge -->
  <g transform="translate(1000, 190)">
    <rect x="-160" y="-24" width="320" height="48" rx="24" fill="#EAF8F5"/>
    <text x="0" y="7" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="#35BFA3">
      WORKSHOP CERTIFICATE
    </text>
  </g>

  <text x="1000" y="320" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="52" font-weight="800" fill="#102A43">
    Certificate of Completion
  </text>
  <line x1="860" y1="360" x2="1140" y2="360" stroke="#00B8D9" stroke-width="3" stroke-linecap="round"/>

  <text x="1000" y="440" text-anchor="middle" font-family="'Inter', sans-serif" font-size="22" fill="#64748B">
    This verifies that
  </text>

  <!-- Name underline -->
  <line x1="450" y1="780" x2="1550" y2="780" stroke="#CBD5E1" stroke-width="1.5"/>

  <text x="1000" y="850" text-anchor="middle" font-family="'Inter', sans-serif" font-size="22" fill="#64748B">
    has successfully completed all modules, practical assignments, and interactive labs.
  </text>

  <g transform="translate(1000, 1100)">
    <line x1="-140" y1="0" x2="140" y2="0" stroke="#102A43" stroke-width="1.5"/>
    <text x="0" y="30" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" font-weight="700" fill="#102A43">Program Facilitator</text>
    <text x="0" y="52" text-anchor="middle" font-family="'Inter', sans-serif" font-size="14" fill="#94A3B8">CertiFlow Community Hub</text>
  </g>
</svg>`,
  },
];

/**
 * Converts an SVG string into a Base64 PNG or SVG Data URL for canvas / PDF embedding
 */
export function getPresetDataUrl(presetId: string): string {
  const preset = TEMPLATE_PRESETS.find(p => p.id === presetId) || TEMPLATE_PRESETS[0];
  const encoded = encodeURIComponent(preset.svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function getPresetById(id: string): TemplatePreset {
  return TEMPLATE_PRESETS.find(p => p.id === id) || TEMPLATE_PRESETS[0];
}
