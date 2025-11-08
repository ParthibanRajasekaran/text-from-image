/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UX_V2?: string;
  readonly VITE_COMMIT?: string;
  readonly VITE_BUILD_TIME?: string;
  readonly VITE_VERCEL_GIT_COMMIT_SHA?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
