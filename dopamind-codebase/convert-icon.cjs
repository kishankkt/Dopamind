const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'logo.svg');
const pngPath = path.join(__dirname, 'public', 'logo.png');

async function convert() {
  try {
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Clean up CSS and force white stroke for the app icon
    svgContent = svgContent.replace(/<style>[\s\S]*?<\/style>/, '');
    
    // Add emerald-deep background (hsl(145, 30%, 15%) is approx #1a3123)
    svgContent = svgContent.replace(/<svg(.*?)>/, '<svg$1 style="background: #1a3123;">'); 
    svgContent = svgContent.replace(/stroke-width/g, 'stroke="#ffffff" stroke-width');

    await sharp(Buffer.from(svgContent))
      .resize(1024, 1024)
      .png()
      .toFile(pngPath);
      
    console.log('Successfully generated logo.png');
  } catch (error) {
    console.error('Failed to convert SVG:', error);
  }
}

convert();
