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
  // 用于记录当前节点的替身节点, 指针
  alternate: FiberNode | null;
  // 用于记录当前节点的操作类型
  effectTag: "PLACEMENT" | "UPDATE" | "DELETION" | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}