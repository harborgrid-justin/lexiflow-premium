/**
 * React Router Configuration
 *
 * Configuration for React Router v7 type generation and build options.
 * This file enables automatic type safety for route params, loader data, and actions.
 *
 * @see https://reactrouter.com/dev/guides/typescript
 */

import type { Config } from "@react-router/dev/config";

export default {
  // Enable type generation for routes
  ssr: true, // Enable SSR - required for loaders and actions

  // App directory containing routes
  appDirectory: "src",

  // Server build directory for SSR
  serverBuildFile: "index.js",

  // Note: Pre-rendering is not compatible with dynamic loaders/actions
  // If you need static generation, use SSG on a per-route basis
} satisfies Config;
