/// <reference types="vite/client" />

interface ImportMetaEnv {
  // GitHub repo that holds the shared data file (public; not secrets).
  readonly VITE_GH_OWNER: string
  readonly VITE_GH_REPO: string
  readonly VITE_GH_BRANCH: string
  readonly VITE_GH_PATH: string
  // Fallback admin password (used only when GitHub is not configured).
  readonly VITE_ADMIN_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
