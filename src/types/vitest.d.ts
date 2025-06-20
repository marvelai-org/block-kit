import type { describe, it, expect, vi } from 'vitest';

declare module 'vitest' {
  export { describe, it, expect, vi };
}

declare module '@vitest/globals' {
  export { describe, it, expect, vi };
}
