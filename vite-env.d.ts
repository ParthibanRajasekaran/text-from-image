/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UX_V2?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
