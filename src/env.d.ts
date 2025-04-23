/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GEMINI_API_KEY: string
  // Add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 