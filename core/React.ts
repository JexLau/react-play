import { ReactElement } from "./typings"

export const createElement = (type: string, props: object, ...children: ReactElement[] | string[]): ReactElement => {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  }
}

const createTextElement = (text: string): ReactElement => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

export const render = (element: ReactElement, container: HTMLElement) => {
  // 创建dom
  const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)
  // 遍历props
  const isProperty = (key: string) => key !== "children"
  Object.keys(element.props).filter(isProperty).forEach(prop => {
    (dom as any)[prop] = element.props[prop]
  })
  // 递归渲染子节点
  // 排除文本节点
  if(dom instanceof HTMLElement) {
    element.props.children?.forEach(child => render(child, dom))
  } else {
    element.props.children?.forEach(child => render(child, container))
  }
  container.appendChild(dom)
}

