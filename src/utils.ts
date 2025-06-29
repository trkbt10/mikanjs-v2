/**
 * Utility functions
 */

export const esc = (s: string): string => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
