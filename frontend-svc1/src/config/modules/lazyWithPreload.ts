import React from 'react';

export type PreloadableComponent<T extends React.ComponentType<unknown>> = React.LazyExoticComponent<T> & {
  preload: () => Promise<unknown>;
};

export function lazyWithPreload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = React.lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory as () => Promise<unknown>;
  return Component;
}
