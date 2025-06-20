/**
 * A utility function that conditionally joins class names together.
 * Filters out falsy values to avoid adding undefined or null classes.
 * 
 * @param classes - Array of class names or objects with class names as keys and conditions as values
 * @returns A single string of concatenated class names
 * 
 * @example
 * // Returns 'button primary large'
 * cn('button', 'primary', true && 'large', false && 'small')
 * 
 * @example
 * // Returns 'button primary disabled'
 * cn('button', { primary: true, disabled: true, active: false })
 */
export function cn(...classes: Array<string | Record<string, boolean | undefined | null>>): string {
  return classes
    .flatMap(cls => {
      if (typeof cls === 'string') {
        return cls.trim();
      }
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}

export default cn;
