export interface ReactElement {
  type: string,
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