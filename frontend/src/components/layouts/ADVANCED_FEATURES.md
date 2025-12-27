# Layout System - Advanced Engineering Features

## 🚀 Advanced Features Overview

This document describes the advanced engineering patterns and utilities available in the LexiFlow layout system.

## Table of Contents

- [Error Boundary HOC](#error-boundary-hoc)
- [Async Boundary](#async-boundary)
- [Layout Composer](#layout-composer)
- [Performance Monitor](#performance-monitor)
- [Best Practices](#best-practices)

---

## Error Boundary HOC

### Overview
Higher-Order Component for wrapping layouts with comprehensive error handling and performance profiling.

### Features
- ✅ Automatic error boundary wrapping
- ✅ Performance monitoring via React Profiler
- ✅ Customizable fallback UI
- ✅ Error recovery mechanisms
- ✅ Telemetry integration

### Usage

```tsx
import { withErrorBoundary, withPageErrorBoundary } from '@/components/layouts';

// Basic usage
const SafeLayout = withErrorBoundary(MyLayout, {
  componentName: 'MyLayout',
  enableProfiling: true,
  onReset: () => console.log('Error recovered'),
});

// Pre-configured for pages
const SafePage = withPageErrorBoundary(MyPage, 'MyPage');

// Use like normal component
<SafeLayout>
  <Content />
</SafeLayout>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `componentName` | `string` | Required | Name for error tracking |
| `fallback` | `ReactNode` | Auto | Custom error UI |
| `onReset` | `() => void` | - | Error recovery callback |
| `enableProfiling` | `boolean` | `dev only` | Enable React Profiler |
| `onError` | `(error, info) => void` | - | Custom error handler |

### Performance Impact
- Development: ~0.5ms overhead per render (profiling enabled)
- Production: ~0.05ms overhead per render (profiling disabled)

---

## Async Boundary

### Overview
Combined Suspense + Error Boundary for handling async operations with automatic retry and timeout.

### Features
- ✅ Suspense boundary for lazy components
- ✅ Error boundary for async failures
- ✅ Automatic retry with exponential backoff
- ✅ Timeout handling for slow networks
- ✅ Customizable loading UI

### Usage

```tsx
import { AsyncBoundary, PageAsyncBoundary } from '@/components/layouts';

// Full control
<AsyncBoundary
  loadingMessage="Loading dashboard..."
  enableRetry={true}
  maxRetries={3}
  timeout={10000}
  onLoad={() => console.log('Loaded')}
  onError={(err) => console.error(err)}
>
  <LazyComponent />
</AsyncBoundary>

// Simplified for pages
<PageAsyncBoundary>
  <LazyPageComponent />
</PageAsyncBoundary>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadingMessage` | `string` | `'Loading...'` | Loading indicator text |
| `loadingFallback` | `ReactNode` | `<LazyLoader />` | Custom loading UI |
| `enableRetry` | `boolean` | `true` | Auto-retry on error |
| `maxRetries` | `number` | `3` | Max retry attempts |
| `timeout` | `number` | `30000` | Timeout in ms |
| `onLoad` | `() => void` | - | Success callback |
| `onError` | `(error) => void` | - | Error callback |

### Retry Strategy
- 1st retry: 1 second delay
- 2nd retry: 2 second delay
- 3rd retry: 4 second delay
- Max delay: 8 seconds

---

## Layout Composer

### Overview
Declarative layout composition with automatic ARIA landmarks, skip links, and responsive behavior.

### Features
- ✅ Declarative section composition
- ✅ Automatic ARIA landmarks
- ✅ Skip-to-content navigation
- ✅ Focus management
- ✅ Print-friendly layouts
- ✅ Responsive breakpoints

### Usage

```tsx
import { LayoutComposer, AppLayoutComposer } from '@/components/layouts';

// Declarative composition
<LayoutComposer
  direction="vertical"
  gap="md"
  enableSkipLinks={true}
  sections={[
    {
      id: 'header',
      content: <Header />,
      role: 'banner',
      ariaLabel: 'Site header',
      flexGrow: 0,
    },
    {
      id: 'main',
      content: <MainContent />,
      role: 'main',
      ariaLabel: 'Main content',
      scrollable: true,
      flexGrow: 1,
    },
  ]}
/>

// Pre-configured app layout
<AppLayoutComposer
  header={<Header />}
  main={<Main />}
  sidebar={<Sidebar />}
/>
```

### Section Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique section ID |
| `content` | `ReactNode` | ✅ | Section content |
| `role` | `string` | - | ARIA role |
| `ariaLabel` | `string` | - | ARIA label |
| `className` | `string` | - | CSS classes |
| `flexGrow` | `number` | `1` | Flex grow factor |
| `scrollable` | `boolean` | `false` | Enable scrolling |
| `printable` | `boolean` | `true` | Show in print |

### Accessibility Features
- **Skip Links**: Automatically generated for main landmarks
- **ARIA Roles**: Proper semantic roles (`main`, `banner`, `navigation`, `complementary`)
- **Focus Management**: Sections are focusable for keyboard navigation
- **Keyboard Navigation**: Tab through sections with skip links

---

## Performance Monitor

### Overview
Real-time performance tracking and budget enforcement for layouts and pages.

### Features
- ✅ Real-time render tracking
- ✅ Performance budget enforcement
- ✅ Memory leak detection
- ✅ Long task monitoring
- ✅ Development-only overhead
- ✅ Visual indicators

### Usage

```tsx
import { PerformanceMonitor, useRenderMetrics } from '@/components/layouts';

// Component wrapper
<PerformanceMonitor
  componentName="DashboardPage"
  renderBudget={16} // 60fps = 16.67ms
  showIndicators={true}
  onBudgetExceeded={(metrics) => {
    console.warn('Slow render:', metrics);
  }}
>
  <YourComponent />
</PerformanceMonitor>

// Hook for metrics
function MyComponent() {
  const { renderCount } = useRenderMetrics('MyComponent');
  // ...
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `componentName` | `string` | Required | Component identifier |
| `renderBudget` | `number` | `16` | Budget in ms (60fps) |
| `showIndicators` | `boolean` | `false` | Show visual indicators |
| `onBudgetExceeded` | `(metrics) => void` | - | Budget exceeded callback |
| `enableInProduction` | `boolean` | `false` | Enable in production |

### Performance Budgets

| Frame Rate | Budget | Use Case |
|------------|--------|----------|
| 60 FPS | 16ms | Smooth animations, interactions |
| 30 FPS | 33ms | Complex renders, data tables |
| 15 FPS | 66ms | Heavy computations, charts |

### Metrics Tracked
- **Render Count**: Total renders since mount
- **Last Render Time**: Most recent render duration
- **Average Render Time**: Rolling average of last 10 renders
- **Slow Renders**: Count of renders exceeding budget
- **Memory Usage**: JS heap size (Chrome only)

### Development Tools

```tsx
import { measureExecutionTime, createPerformanceMark, measurePerformance } from '@/components/layouts';

// Measure function execution
const optimizedFn = measureExecutionTime(myExpensiveFunction, 'DataProcessing');

// Performance marks
createPerformanceMark('data-fetch-start');
// ... do work
createPerformanceMark('data-fetch-end');
const duration = measurePerformance('data-fetch', 'data-fetch-start', 'data-fetch-end');
```

---

## Best Practices

### 1. Error Boundaries
✅ **DO**: Wrap every page with error boundary
```tsx
const SafePage = withPageErrorBoundary(MyPage, 'MyPage');
```

❌ **DON'T**: Use error boundaries for expected errors (use error states)

### 2. Async Operations
✅ **DO**: Use AsyncBoundary for lazy-loaded routes
```tsx
<AsyncBoundary timeout={10000} maxRetries={3}>
  <LazyRoute />
</AsyncBoundary>
```

❌ **DON'T**: Set timeout too low (causes false timeouts on slow connections)

### 3. Performance Monitoring
✅ **DO**: Monitor critical user paths in development
```tsx
<PerformanceMonitor componentName="CheckoutFlow" showIndicators={true}>
  <Checkout />
</PerformanceMonitor>
```

❌ **DON'T**: Enable in production without A/B testing (adds overhead)

### 4. Layout Composition
✅ **DO**: Use semantic ARIA roles
```tsx
<LayoutComposer sections={[
  { id: 'nav', role: 'navigation', ariaLabel: 'Main navigation', ... }
]} />
```

❌ **DON'T**: Nest LayoutComposers deeply (max 2-3 levels)

---

## Performance Optimization Checklist

### Layout Level
- [ ] Wrap layouts with `withErrorBoundary` HOC
- [ ] Use `AsyncBoundary` for lazy-loaded content
- [ ] Enable performance monitoring in development
- [ ] Set appropriate render budgets (16ms default)
- [ ] Use `React.memo` for expensive layout components

### Component Level
- [ ] Use `useMemo` for expensive computations
- [ ] Use `useCallback` for stable function references
- [ ] Implement virtualization for long lists
- [ ] Lazy load heavy components
- [ ] Profile with React DevTools Profiler

### Network Level
- [ ] Implement request caching
- [ ] Use optimistic updates
- [ ] Enable stale-while-revalidate
- [ ] Batch network requests
- [ ] Implement request deduplication

### Accessibility Level
- [ ] Add ARIA landmarks
- [ ] Enable skip links
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios

---

## Migration Guide

### From Basic Layout to Advanced

**Before:**
```tsx
<PageContainerLayout>
  <MyContent />
</PageContainerLayout>
```

**After:**
```tsx
<AsyncBoundary>
  <PerformanceMonitor componentName="MyPage">
    <PageContainerLayout>
      <MyContent />
    </PageContainerLayout>
  </PerformanceMonitor>
</AsyncBoundary>
```

### Adding Error Boundaries

**Before:**
```tsx
export const MyPage = () => <div>Content</div>;
```

**After:**
```tsx
const MyPage = () => <div>Content</div>;
export default withPageErrorBoundary(MyPage, 'MyPage');
```

---

## Troubleshooting

### Performance Issues
**Symptom**: Renders exceed budget frequently
**Solution**: 
1. Use React DevTools Profiler to identify bottlenecks
2. Memoize expensive computations with `useMemo`
3. Use `React.memo` for child components
4. Consider virtualization for large lists

### Async Loading Failures
**Symptom**: Components timeout during load
**Solution**:
1. Increase timeout: `<AsyncBoundary timeout={30000}>`
2. Check network connectivity
3. Verify lazy imports are correct
4. Check console for specific error messages

### Skip Links Not Working
**Symptom**: Skip links don't focus sections
**Solution**:
1. Ensure sections have unique IDs
2. Verify sections have `tabIndex={-1}`
3. Check CSS isn't hiding focus indicators
4. Test with keyboard navigation

---

## Performance Metrics

### Bundle Size Impact
- `withErrorBoundary`: +2KB gzipped
- `AsyncBoundary`: +3KB gzipped
- `LayoutComposer`: +4KB gzipped
- `PerformanceMonitor`: +5KB gzipped (dev only)

### Runtime Overhead
- Error Boundary: ~0.05ms per render
- Async Boundary: ~0.1ms per render
- Layout Composer: ~0.2ms per render
- Performance Monitor: ~0.5ms per render (dev only)

---

## Examples Repository

See `/frontend/src/components/pages` for real-world examples of these patterns in action.

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0
**Maintainer**: LexiFlow Engineering Team
