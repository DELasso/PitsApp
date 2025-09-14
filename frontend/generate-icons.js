const fs = require('fs');
const path = require('path');

// Script para generar iconos PWA desde el logo principal
// Este script requiere que tengas ImageMagick o similar instalado

const logoPath = './src/assets/PitsApp01.png';
const iconsDir = './public/icons';

// Tamaños de iconos requeridos para PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

console.log('🎨 Generando iconos PWA desde PitsApp01.png...');
console.log('');

// Verificar que existe el directorio de iconos
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Verificar que existe el logo
if (!fs.existsSync(logoPath)) {
  console.error('❌ No se encontró el logo en:', logoPath);
  process.exit(1);
}

console.log('✅ Logo encontrado:', logoPath);
console.log('📁 Directorio de iconos:', iconsDir);
console.log('');

// Generar comandos para diferentes herramientas
console.log('🔧 OPCIONES PARA GENERAR ICONOS:');
console.log('');

console.log('📋 OPCIÓN 1 - Con ImageMagick (recomendado):');
console.log('Instala ImageMagick y ejecuta estos comandos:');
console.log('');

iconSizes.forEach(icon => {
  const outputPath = path.join(iconsDir, icon.name);
  console.log(`magick "${logoPath}" -resize ${icon.size}x${icon.size} "${outputPath}"`);
});

console.log('');
console.log('📋 OPCIÓN 2 - Con FFmpeg:');
iconSizes.forEach(icon => {
  const outputPath = path.join(iconsDir, icon.name);
  console.log(`ffmpeg -i "${logoPath}" -vf scale=${icon.size}:${icon.size} "${outputPath}"`);
});

console.log('');
console.log('📋 OPCIÓN 3 - Online (más fácil):');
console.log('1. Ve a: https://www.pwabuilder.com/imageGenerator');
console.log('2. Sube tu logo: src/assets/PitsApp01.png');
console.log('3. Descarga los iconos generados');
console.log('4. Reemplaza los archivos en: public/icons/');

console.log('');
console.log('📋 OPCIÓN 4 - Copia manual:');
console.log('Si no puedes usar herramientas de resize, puedes copiar el logo original a cada tamaño:');
console.log('');

iconSizes.forEach(icon => {
  const outputPath = path.join(iconsDir, icon.name);
  console.log(`copy "${logoPath}" "${outputPath}"`);
});

console.log('');
console.log('⚠️  NOTA: Para mejor calidad, usa la OPCIÓN 1 o 3');
console.log('💡 Los iconos se redimensionarán automáticamente por el navegador si es necesario');