/**
 * Utility helper for merging class names.
 */
export function cn(...inputs: any[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        return Object.entries(item)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}
