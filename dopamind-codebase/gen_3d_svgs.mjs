import fs from 'fs';
import path from 'path';

const outDir = './public/3d_branding';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const frames = 12;

for (let i = 0; i < frames; i++) {
  // 360 / 12 = 30 degrees per step. 
  const angleDeg = i * 30;
  const angleRad = angleDeg * (Math.PI / 180);
  const scaleX = Math.cos(angleRad);
  // To avoid scaleX=0 causing disappearing path
  const finalScaleX = Math.abs(scaleX) < 0.05 ? (scaleX < 0 ? -0.05 : 0.05) : scaleX;

  // Let's add a fake 3D extrusion if it's turned
  const depth = Math.round(Math.abs(Math.sin(angleRad)) * 10);
  const depthDirection = scaleX >= 0 ? -1 : 1;
  
  let extrusionStr = '';
  // Darker green for extrusion
  for (let d = 1; d <= depth; d++) {
    const shift = d * depthDirection * 0.8;
    extrusionStr += `
    <g transform="translate(${shift}, 0) scale(${finalScaleX}, 1)" transform-origin="50 50" color="rgba(40, 77, 54, 0.4)" stroke="rgba(40, 77, 54, 0.4)">
      <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M50 88 V28" stroke-width="3" stroke-linecap="round" />
      <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke-width="3" stroke-linecap="round" />
      <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke-width="3" stroke-linecap="round" />
      <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke-width="3" stroke-linecap="round" />
      <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke-width="3" stroke-linecap="round" />
      <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke-width="3" stroke-linecap="round" />
      <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke-width="3" stroke-linecap="round" />
    </g>`;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" width="100%" height="100%">
    ${extrusionStr}
    <g transform="scale(${finalScaleX}, 1)" transform-origin="50 50" color="currentColor">
      <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M50 88 V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <circle cx="50" cy="12" r="4.5" fill="#047857" />
    </g>
  </svg>`;

  fs.writeFileSync(path.join(outDir, `frame_${String(i).padStart(2, '0')}.svg`), svgContent);
}
console.log('12 SVGs generated in public/3d_branding');
