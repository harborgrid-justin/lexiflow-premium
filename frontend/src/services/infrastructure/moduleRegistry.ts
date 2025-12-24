/**
 * @module services/moduleRegistry
 * @category Services - Navigation
 * @description Module registry service managing dynamic module definitions with intent-based resolution.
 * Provides batch registration for initialization, module retrieval by ID, intent matching with fuzzy
 * navigation ("open billing" → "billing" ID), and subscription-based change notifications for dynamic
 * menu re-rendering.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import { ModuleDefinition } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type RegistryListener = () => void;

// ============================================================================
// SERVICE CLASS
// ============================================================================
class ModuleRegistryService {
  private modules: Map<string, ModuleDefinition> = new Map();
  private listeners: Set<RegistryListener> = new Set();

  /**
   * Register a single module definition.
   */
  register(module: ModuleDefinition) {
    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} already registered. Overwriting.`);
    }
    this.modules.set(module.id, module);
    this.notifyListeners();
    return this;
  }

  /**
   * Batch register multiple modules for initialization.
   */
  registerBatch(modules: ModuleDefinition[]) {
    modules.forEach(m => this.modules.set(m.id, m));
    this.notifyListeners();
  }

  /**
   * Retrieve a module definition by ID (view path).
   */
  getModule(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules for navigation rendering.
   */
  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Intent-based Resolution: Finds the best module to handle a specific intent string.
   * This allows "fuzzy" navigation like "open billing" -> resolves to "billing" ID.
   */
  resolveIntent(intent: string, context?: unknown): string | null {
    // 1. Direct ID match
    if (this.modules.has(intent)) return intent;

    // 2. Pattern Matching or Custom Matchers (Future extensibility)
    for (const [id, module] of this.modules.entries()) {
      if (module.intentMatcher && module.intentMatcher(intent, context)) {
        return id;
      }
      // Simple case-insensitive label match fallback
      if (module.label.toLowerCase() === intent.toLowerCase()) {
        return id;
      }
    }

    return null;
  }

  /**
   * Subscribe to registry updates (for dynamic menu re-rendering).
   */
  subscribe(listener: RegistryListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }
}

export const ModuleRegistry = new ModuleRegistryService();

