export interface ReactElement {
  type: string,
  props: {
    id?: string,
    nodeValue?: string,
    children?: ReactElement[]
    [key: string]: any
  }
}