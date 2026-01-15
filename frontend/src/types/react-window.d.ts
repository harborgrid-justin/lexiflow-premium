declare module "react-window" {
  import { ComponentType, CSSProperties, PureComponent } from "react";

  export type ListOnItemsRenderedProps = {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  };

  export type ListOnScrollProps = {
    scrollDirection: "forward" | "backward";
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  };

  export type ListProps = {
    children: ComponentType<{
      index: number;
      style: CSSProperties;
      data?: unknown;
    }>;
    className?: string;
    direction?: "ltr" | "rtl" | "horizontal" | "vertical";
    height: number | string;
    initialScrollOffset?: number;
    innerElementType?: string | ComponentType<Record<string, unknown>>;
    innerRef?: React.Ref<HTMLElement>;
    innerTagName?: string; // deprecated
    itemCount: number;
    itemData?: unknown;
    itemKey?: (index: number, data: unknown) => React.Key;
    itemSize: number | ((index: number) => number);
    layout?: "vertical" | "horizontal";
    onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
    onScroll?: (props: ListOnScrollProps) => void;
    outerElementType?: string | ComponentType<Record<string, unknown>>;
    outerRef?: React.Ref<HTMLElement>;
    outerTagName?: string; // deprecated
    overscanCount?: number;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width: number | string;
  };

  export class FixedSizeList extends PureComponent<ListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(
      index: number,
      align?: "auto" | "smart" | "center" | "end" | "start"
    ): void;
  }

  export class VariableSizeList extends PureComponent<ListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(
      index: number,
      align?: "auto" | "smart" | "center" | "end" | "start"
    ): void;
    resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
  }
}
