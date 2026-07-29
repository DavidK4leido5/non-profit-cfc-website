interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly url: string;
}

declare module "*.css" {}

declare module "*.png" {
  const src: string;
  export default src;
}
