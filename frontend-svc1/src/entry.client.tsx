/**
 * Entry Client
 *
 * Client-side entry point for React Router application.
 * Delegates to the rendering module's client initialization.
 *
 * @see @rendering/client for implementation details
 */

import { initializeModules } from "@/config/modules/initializeModules";
import { initializeClient } from "@rendering/client";

// Initialize modules before rendering
initializeModules();

// Initialize the client-side application
initializeClient();
