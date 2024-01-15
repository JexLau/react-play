export interface ReactElement {
  type: string | Function,
  props: {
    id?: string,
    nodeValue?: string,
    children?: ReactElement[]
    [key: string]: any
  }
}

export interface FiberNode extends Partial<ReactElement> {
  dom:  (HTMLElement | Text) | null;
  props: { [key: string]: any };
  children: FiberNode | null;
  parent: FiberNode | null;
  sibling: FiberNode | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}