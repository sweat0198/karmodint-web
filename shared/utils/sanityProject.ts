/** The project id a checkout runs with when no Sanity project is configured (tests, a fresh clone). */
export const PLACEHOLDER_SANITY_PROJECT_ID = "dummy_project_id";

/** Whether a real Sanity project is configured; without one there are no Sanity pages to build or list. */
export function hasSanityProject(projectId: string | undefined): projectId is string {
  return Boolean(projectId) && projectId !== PLACEHOLDER_SANITY_PROJECT_ID;
}
