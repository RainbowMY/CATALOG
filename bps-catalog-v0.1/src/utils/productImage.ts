const SHAPES = [
  // soft bag
  `<rect x="190" y="170" width="220" height="260" rx="36" fill="ACCENT" opacity="0.9"/>
   <path d="M230 170 C230 120 370 120 370 170" stroke="DEEP" stroke-width="18" fill="none" stroke-linecap="round"/>`,
  // bottle
  `<rect x="240" y="200" width="120" height="240" rx="28" fill="ACCENT"/>
   <rect x="268" y="150" width="64" height="60" rx="12" fill="DEEP"/>
   <rect x="255" y="250" width="90" height="24" rx="8" fill="LIGHT" opacity="0.55"/>`,
  // shoe
  `<path d="M140 340 C180 250 280 230 360 250 C430 268 470 300 480 340 L140 340 Z" fill="ACCENT"/>
   <ellipse cx="250" cy="300" rx="36" ry="18" fill="LIGHT" opacity="0.45"/>`,
  // watch
  `<rect x="255" y="120" width="90" height="70" rx="18" fill="DEEP"/>
   <circle cx="300" cy="300" r="110" fill="ACCENT"/>
   <circle cx="300" cy="300" r="78" fill="LIGHT" opacity="0.55"/>
   <rect x="255" y="410" width="90" height="70" rx="18" fill="DEEP"/>`,
  // apparel tee
  `<path d="M180 180 L250 150 L300 190 L350 150 L420 180 L390 230 L360 210 L360 420 L240 420 L240 210 L210 230 Z" fill="ACCENT"/>
   <circle cx="300" cy="280" r="28" fill="LIGHT" opacity="0.35"/>`,
  // speaker
  `<rect x="170" y="160" width="260" height="280" rx="40" fill="ACCENT"/>
   <circle cx="300" cy="300" r="78" fill="DEEP" opacity="0.35"/>
   <circle cx="300" cy="300" r="42" fill="LIGHT" opacity="0.5"/>`,
  // mug
  `<rect x="190" y="190" width="180" height="220" rx="28" fill="ACCENT"/>
   <path d="M370 230 C430 230 430 370 370 370" stroke="DEEP" stroke-width="22" fill="none"/>
   <rect x="210" y="210" width="140" height="28" rx="10" fill="LIGHT" opacity="0.4"/>`,
  // lamp
  `<path d="M180 220 L420 220 L360 340 L240 340 Z" fill="ACCENT"/>
   <rect x="285" y="340" width="30" height="90" rx="8" fill="DEEP"/>
   <rect x="250" y="430" width="100" height="22" rx="8" fill="DEEP"/>`,
]

function hsl(h: number, s: number, l: number) {
  return `hsl(${h} ${s}% ${l}%)`
}

export function makeProductImage(seed: number, label: string): string {
  const hue = (seed * 47) % 360
  const shape = SHAPES[seed % SHAPES.length]
  const accent = hsl(hue, 58, 58)
  const deep = hsl((hue + 20) % 360, 48, 38)
  const light = hsl(hue, 70, 92)
  const bgA = hsl((hue + 180) % 360, 32, 94)
  const bgB = hsl(hue, 40, 88)
  const markup = shape
    .replaceAll('ACCENT', accent)
    .replaceAll('DEEP', deep)
    .replaceAll('LIGHT', light)

  const short = label.slice(0, 18).replace(/[<>&]/g, '')
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgA}"/>
      <stop offset="100%" stop-color="${bgB}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="640" fill="url(#g)"/>
  <circle cx="520" cy="120" r="90" fill="${accent}" opacity="0.12"/>
  <circle cx="110" cy="520" r="120" fill="${deep}" opacity="0.08"/>
  <g transform="translate(20,10)">${markup}</g>
  <rect x="40" y="560" width="560" height="44" rx="14" fill="white" opacity="0.55"/>
  <text x="320" y="589" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="18" font-weight="600" fill="#2a2f3a">${short}</text>
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
