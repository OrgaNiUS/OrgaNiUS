// Collection of useful helper functions for manipulating strings and text.

// Changes a string to title case.
// abCA -> Abca
// username -> Username
// jIM -> Jim
export const toTitleCase = (s: string) => {
  if (s.length <= 0) {
    return s;
  }
  const head: string = s.substring(0, 1);
  const rest: string = s.substring(1);
  return head.toUpperCase() + rest.toLowerCase();
};
