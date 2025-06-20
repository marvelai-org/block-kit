const fs = require('fs');
const path = require('path');

// Path to the problematic file
const filePath = path.resolve(__dirname, '../src/blocks/media-block/ImageBlock.tsx');

// Read the file content
let content = fs.readFileSync(filePath, 'utf-8');

// Add a comment at the top to disable HMR for this file
const hmrDisableComment = '// @vite-disable-hmr\n';

if (!content.startsWith(hmrDisableComment)) {
  // Add the disable HMR comment if not already present
  content = hmrDisableComment + content;
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Added HMR disable comment to ImageBlock.tsx');
} else {
  console.log('HMR disable comment already present in ImageBlock.tsx');
}
