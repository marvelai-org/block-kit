// Test file to verify module resolution
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function testImports() {
  const testImports = {
    // Test root imports
    root: {
      'process.cwd()': process.cwd(),
      '__dirname': __dirname,
      '__filename': __filename,
    },
    
    // Test path resolutions
    paths: {
      'import.meta.url': import.meta.url,
      'new URL(\'./\', import.meta.url)': new URL('./', import.meta.url).toString(),
      'path.resolve(__dirname, \'..\')': path.resolve(__dirname, '..'),
      'path.resolve(process.cwd(), \'src\')': path.resolve(process.cwd(), 'src'),
    },
    
    // Test environment
    env: {
      'process.env.NODE_ENV': process.env.NODE_ENV,
      'import.meta.env.MODE': import.meta.env?.MODE,
    }
  };

  console.log('=== Test Imports ===');
  console.dir(testImports, { depth: null, colors: true });
  
  return testImports;
}

// Run the test when this file is imported
testImports();
