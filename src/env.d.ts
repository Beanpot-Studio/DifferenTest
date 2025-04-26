/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MAILGUN_API_KEY: string;
  readonly PUBLIC_MAILGUN_DOMAIN: string;
  readonly PUBLIC_MAILGUN_CONTACT_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 