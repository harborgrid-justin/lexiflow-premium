/**
 * Document Drafting Route
 *
 * Displays document drafting and assembly tools
 */

import type { Route } from "./+types/index";

export function meta() {
  return [
    { title: "Document Drafting - LexiFlow" },
    { name: "description", content: "Draft and assemble legal documents" },
  ];
}

export async function loader(_args: Route.LoaderArgs) {
  // TODO: Fetch drafting templates from API
  return { data: null };
}

export default function DraftingIndexRoute() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Document Drafting</h1>
      <p className="text-gray-600">This route is under construction.</p>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="p-8 text-center text-red-600">
      Failed to load Document Drafting: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
