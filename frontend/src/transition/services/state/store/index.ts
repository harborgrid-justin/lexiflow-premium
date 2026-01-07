/**
 * Store - Central state store
 * Can integrate with Redux, Zustand, or custom implementation
 */

// Example using a simple observable store pattern
type Listener = () => void;

interface StoreState {
  [key: string]: any;
}

class Store {
  private state: StoreState = {};
  private listeners: Set<Listener> = new Set();

  getState<T = any>(key: string): T | undefined {
    return this.state[key];
  }

  setState(key: string, value: any): void {
    this.state[key] = value;
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // For SSR hydration
  hydrate(initialState: StoreState): void {
    this.state = { ...this.state, ...initialState };
  }

  // For SSR dehydration
  dehydrate(): StoreState {
    return { ...this.state };
  }
}

export const store = new Store();
