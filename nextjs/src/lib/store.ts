/**
 * Jotai State Management Setup
 * Client-side state atoms for LexiFlow
 */

import { Case, User } from "@/types";
import { atom } from "jotai";

// User state
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

// Theme state
export const themeAtom = atom<"light" | "dark">("light");

// Selected case state
export const selectedCaseAtom = atom<Case | null>(null);

// UI state
export const sidebarOpenAtom = atom(true);
export const searchQueryAtom = atom("");

// Filters
export const caseFiltersAtom = atom({
  status: "ALL" as const,
  priority: "ALL" as const,
  searchQuery: "",
});
