import type { Plugin } from 'vite';

/**
 * This plugin prevents duplicate HMR code injection in Vite
 * which causes the "variable already declared" errors
 */
export function viteHmrFixPlugin(): Plugin {
  return {
    name: 'vite-hmr-fix',
    enforce: 'pre',
    transform(code, id) {
      // Only process the problematic file
      if (id.includes('ImageBlock.tsx')) {
        // This pattern matches the HMR code that gets injected
        const hmrPattern = /const inWebWorker = typeof WorkerGlobalScope !== 'undefined' \&\& self instanceof WorkerGlobalScope;\s+let prevRefreshReg;\s+let prevRefreshSig;/g;
        
        // Count occurrences
        const matches = code.match(hmrPattern);
        if (matches && matches.length > 1) {
          // Keep only the first occurrence
          return code.replace(hmrPattern, (match, offset) => 
            offset === 0 ? match : ''
          );
        }
      }
      return code;
    },
  };
}

export default viteHmrFixPlugin;
