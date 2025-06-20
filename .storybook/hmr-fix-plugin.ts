import type { Plugin } from 'vite';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Vite plugin to fix duplicate HMR variable declarations in ImageBlock.tsx
 */
export function hmrFixPlugin(): Plugin {
  return {
    name: 'hmr-fix',
    enforce: 'pre',
    transform(code, id) {
      // Only process the problematic file
      if (!id.endsWith('ImageBlock.tsx')) {
        return;
      }

      try {
        // Parse the code into an AST
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });

        let hasHmrCode = false;

        // Traverse the AST to find and modify the HMR code
        traverse(ast, {
          Program(path) {
            // Look for the HMR variable declarations
            const hmrVars = ['inWebWorker', 'prevRefreshReg', 'prevRefreshSig'];
            
            // Find all variable declarations at the top level
            path.traverse({
              VariableDeclaration(varPath) {
                const declarations = varPath.get('declarations');
                
                // Check if this is an HMR variable declaration
                const isHmrVar = declarations.some(decl => {
                  const id = decl.get('id');
                  return id.isIdentifier() && hmrVars.includes(id.node.name);
                });
                
                if (isHmrVar) {
                  hasHmrCode = true;
                  // Replace with a no-op if this is a duplicate
                  if (declarations.length === 1 && declarations[0].node.id.name === 'inWebWorker') {
                    varPath.remove();
                  } else if (declarations.length === 1 && declarations[0].node.id.name === 'prevRefreshReg') {
                    varPath.remove();
                  } else if (declarations.length === 1 && declarations[0].node.id.name === 'prevRefreshSig') {
                    varPath.remove();
                  }
                }
              },
            });
          },
        });

        // Only generate new code if we found and modified HMR code
        if (hasHmrCode) {
          const result = generate(ast, {
            retainLines: true,
            compact: false,
            comments: true,
            sourceMaps: true,
            sourceFileName: id,
          });
          
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (error) {
        console.error('Error in hmr-fix plugin:', error);
      }
      
      return code;
    },
  };
}

export default hmrFixPlugin;
