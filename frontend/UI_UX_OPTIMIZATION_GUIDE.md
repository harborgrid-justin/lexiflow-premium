# React UI/UX Advanced Optimization Guide

This project implements "engineer-level" optimizations to ensure high performance and stability.

## 1. Zero Layout Shift Guarantee

**Requirement**: The UI must not change spatial dimensions after first paint.

**Implementation**:

- Use `StableImage` for all images. It enforces dimensions and shows a skeleton loader.
- Use `Skeleton` with explicit `width` and `height` for loading states.

```tsx
import { StableImage } from '@/components/atoms/StableImage';
import { Skeleton } from '@/components/atoms/Skeleton';

// Correct:
<StableImage width={200} height={150} src={url} />
<Skeleton width="100%" height={40} />
```

## 2. Input Latency Protection

**Requirement**: User input must remain responsive (<100ms) under heavy render load.

**Implementation**:

- Use `useOptimizedInput` to separate urgent UI updates from expensive side effects.

```tsx
import { useOptimizedInput } from "@/hooks/performance";

function SearchInput({ onSearch }) {
  const { value, onChange, isPending } = useOptimizedInput("", onSearch);

  return (
    <div>
      <input value={value} onChange={onChange} />
      {isPending && <Spinner />} // Indicates deferred update processing
    </div>
  );
}
```

## 3. Scroll Performance Isolation

**Requirement**: Scrolling must remain at 60fps regardless of content size.

**Implementation**:

- Use `useVirtualList` for long lists.
- **Key Change**: `useVirtualList` no longer causes re-renders on every scroll pixel, only when the rendered range changes.

```tsx
import { useVirtualList } from "@/hooks/useVirtualList";

function HugeList({ items }) {
  const { virtualItems, totalHeight, onScroll } = useVirtualList(items, {
    itemHeight: 50,
    containerHeight: 500,
  });

  return (
    <div style={{ height: 500, overflow: "auto" }} onScroll={onScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map(({ index, data, style }) => (
          <div key={index} style={style}>
            {data.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. Optimistic UI with Safe Rollback

**Requirement**: Optimistic updates must be reversible and robust.

**Implementation**:

- Use `useSafeOptimisticUpdate` to handle state versioning and rollback.

```tsx
import { useSafeOptimisticUpdate } from "@/hooks/performance";

function LikeButton({ initialCount }) {
  const { state, update } = useSafeOptimisticUpdate(initialCount);

  const handleClick = () => {
    update(state + 1, async (newState) => {
      await api.post("/like", { count: newState });
    });
  };

  return <button onClick={handleClick}>{state}</button>;
}
```

## 5. Visual Stability (Key Usage)

**Requirement**: No jitter during transitions.

- **Rule**: Never use array index as `key` if the list can change order.
- **Rule**: Use stable IDs.
- **Rule**: Avoid conditional hook calls (Lint rule enforces this).

## 6. Deterministic Loading

**Requirement**: No flash of loading states.

- Use `useMinDisplayTime` inside loaders to ensure they persist for at least 200ms if they appear.
