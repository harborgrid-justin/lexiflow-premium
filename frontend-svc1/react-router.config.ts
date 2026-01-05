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
  ssr: true,

  // App directory containing routes
  appDirectory: "src",

  // Server build directory for SSR
  serverBuildFile: "index.js",

  // Configure pre-rendering for static pages
  async prerender() {
    return [
      "/",
      "/dashboard",
      // Add more static routes here that can be pre-rendered at build time
    ];
  },
} satisfies Config;
