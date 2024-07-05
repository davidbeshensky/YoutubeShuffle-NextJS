// global.d.ts
export {};

declare global {
  interface Window {
    google: typeof google;
    onYouTubeIframeAPIReady: () => void;
  }
}

// types.d.ts
declare module '@clerk/clerk-sdk-node';
declare module '@clerk/nextjs';
declare module 'googleapis';
