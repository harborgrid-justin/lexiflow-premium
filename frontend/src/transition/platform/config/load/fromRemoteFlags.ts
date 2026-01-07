/**
 * Load remote feature flags
 */

export async function loadFromRemoteFlags(): Promise<Record<string, boolean>> {
  try {
    const response = await fetch("/api/feature-flags");
    return await response.json();
  } catch (error) {
    console.error("Failed to load remote feature flags:", error);
    return {};
  }
}
