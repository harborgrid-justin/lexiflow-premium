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
      data?: any;
    }>;
    className?: string;
    direction?: "ltr" | "rtl" | "horizontal" | "vertical";
    height: number | string;
    initialScrollOffset?: number;
    innerElementType?: string | ComponentType<any>;
    innerRef?: React.Ref<any>;
    innerTagName?: string; // deprecated
    itemCount: number;
    itemData?: any;
    itemKey?: (index: number, data: any) => any;
    itemSize: number | ((index: number) => number);
    layout?: "vertical" | "horizontal";
    onItemsRendered?: (props: ListOnItemsRenderedProps) => any;
    onScroll?: (props: ListOnScrollProps) => any;
    outerElementType?: string | ComponentType<any>;
    outerRef?: React.Ref<any>;
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
