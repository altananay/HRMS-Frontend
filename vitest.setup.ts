import '@testing-library/jest-dom/vitest';

// MUI reads matchMedia for responsive breakpoints and for prefers-color-scheme; jsdom does not
// implement it, so every component test would throw before rendering a single element.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
