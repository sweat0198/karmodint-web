export interface SanityImageConfig {
  projectId: string;
  dataset: string;
}

/**
 * `useRuntimeConfig` is a Nuxt auto-import: real in the app, undeclared under plain vitest. The
 * `typeof` check reads as `false` rather than throwing in that case, same guard already used by
 * `useGooglePlacesAutocomplete`.
 */
export function resolveSanityImageConfig(): SanityImageConfig {
  try {
    if (typeof useRuntimeConfig === "function") {
      const config = useRuntimeConfig();
      return { projectId: config.public.sanityProjectId, dataset: config.public.sanityDataset };
    }
  } catch {
    // Non-Nuxt / test context fallback
  }
  return { projectId: "", dataset: "" };
}
