declare module 'react' {
  export type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];
  export type ReactElement = any;
  export type FC<P = {}> = FunctionComponent<P>;
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
  export type Props<P = {}> = Partial<P> & { children?: ReactNode };

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export type ComponentType<P = {}> = FunctionComponent<P> | ComponentClass<P>;

  export interface ComponentClass<P = {}> {
    new (props: P, context?: any): Component<P, any>;
  }

  export class Component<P = {}, S = {}> {
    constructor(props: P, context?: any);
    props: Readonly<P> & Readonly<{ children?: ReactNode }>;
    state: Readonly<S>;
    context: any;
    refs: any;
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    componentDidMount?(): void;
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    componentWillUnmount?(): void;
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): any;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void;
  }

  export interface ErrorInfo {
    componentStack: string;
  }

  export type RefObject<T> = { readonly current: T | null };
  export type RefCallback<T> = (instance: T | null) => void;
  export type Ref<T> = RefCallback<T> | RefObject<T> | null;
  export type LegacyRef<T> = string | Ref<T>;

  export type ReactEventHandler<T = Element> = (event: any) => void;
  export type EventHandler<E extends any = any> = (event: E) => void;

  export function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prev: S) => S)) => void];
  export function useState<S = undefined>(): [S | undefined, (newState: S | ((prev: S | undefined) => S | undefined) | undefined) => void];

  export function useEffect(effect: () => (void | (() => void)), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useRef<T = undefined>(): { current: T | undefined };
  export function useContext<T>(context: Context<T>): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  export function useLayoutEffect(effect: () => (void | (() => void)), deps?: readonly any[]): void;
  export function useImperativeHandle<T>(ref: any, createHandle: () => T, deps?: readonly any[]): void;
  export function useDebugValue<T>(value: T, format?: (value: T) => any): void;
  export function useId(): string;
  export function useTransition(): [boolean, (callback: () => void) => void];
  export function useDeferredValue<T>(value: T): T;
  export function useSyncExternalStore<T>(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => T, getServerSnapshot?: () => T): T;

  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  export interface Provider<T> {
    (props: { value: T; children?: ReactNode }): ReactElement;
  }

  export interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): ReactElement;
  }

  export function createContext<T>(defaultValue: T): Context<T>;
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export function cloneElement(element: ReactElement, props?: any, ...children: any[]): ReactElement;
  export function isValidElement(object: any): boolean;
  export const Fragment: any;
  export const StrictMode: any;
  export const Suspense: any;
  export function lazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): T;
  export function memo<P>(component: FunctionComponent<P>, propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean): FunctionComponent<P>;
  export function forwardRef<T, P = {}>(render: (props: P, ref: any) => ReactElement | null): FunctionComponent<P & { ref?: any }>;

  export type CSSProperties = any;
  export type HTMLAttributes<T> = any;
  export type SVGAttributes<T> = any;

  export type MouseEvent<T = Element> = any;
  export type KeyboardEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type ClipboardEvent<T = Element> = any;
  export type CompositionEvent<T = Element> = any;
  export type DragEvent<T = Element> = any;
  export type PointerEvent<T = Element> = any;
  export type TouchEvent<T = Element> = any;
  export type UIEvent<T = Element> = any;
  export type WheelEvent<T = Element> = any;
  export type AnimationEvent<T = Element> = any;
  export type TransitionEvent<T = Element> = any;

  export type MouseEventHandler<T = Element> = (event: MouseEvent<T>) => void;
  export type KeyboardEventHandler<T = Element> = (event: KeyboardEvent<T>) => void;
  export type FocusEventHandler<T = Element> = (event: FocusEvent<T>) => void;
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  export type ChangeEventHandler<T = Element> = (event: ChangeEvent<T>) => void;

  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);

  global {
    namespace JSX {
      interface Element extends React.ReactElement<any, any> {}
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
  }
}

declare module 'react-dom' {
  export function render(element: any, container: Element | null, callback?: () => void): void;
  export function hydrate(element: any, container: Element | null, callback?: () => void): void;
  export function unmountComponentAtNode(container: Element | null): boolean;
  export function findDOMNode(instance: any): Element | null | Text;
  export function createPortal(children: any, container: Element): any;
  export const version: string;
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: any): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element | Document, initialChildren: any): Root;
}
