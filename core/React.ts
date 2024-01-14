import { FiberNode, ReactElement } from "./typings"

export const createElement = (type: string, props: object, ...children: ReactElement[] | string[]): ReactElement => {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    },
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
let nextUnitOfWork: FiberNode | null = null;

export const render = (element: ReactElement, container: HTMLElement) => {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
    parent: null,
    sibling: null,
    children: null
  }
  requestIdleCallback(workLoop)
}


export const workLoop = (deadline: IdleDeadline) => {
  let shouldYeild = false;

  while (!shouldYeild && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    console.log("nextUnitOfWork", nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

function createDom(type: string) {
  return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type)
}
// 把dom树转换为链表
// 1. 创建dom树和添加props
// 2. 把dom树转换为链表: 
function performUnitOfWork(work: FiberNode | null) {
  if (!work?.dom) return null
  work.dom = createDom(work!.type || "div")
  const dom = work.dom;
  (work.parent?.dom as HTMLElement)?.append(dom);
  // 遍历props
  Object.keys(work.props).forEach(prop => {
    if (prop !== "children") {
      (dom as any)[prop] = work.props[prop]
    }
  })
  // 转换为链表, 从这棵树的children开始
  const children = work.props.children
  let prevSibling: FiberNode | null = null
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 构建fiber节点
    const newFiber: FiberNode = {
      dom: child,
      props: child.props,
      children: null,
      parent: work,
      sibling: null
    }
    if (prevSibling) {
      // 如果有上一个节点, 把上一个节点的sibling设置为当前节点
      prevSibling.sibling = newFiber
    } else {
      // 如果没有上一个节点, 把当前节点设置为children
      work.children = newFiber
    }
    // 把当前节点设置为上一个节点
    prevSibling = newFiber
  }

  // 找到下一个工作单元
  if (work.children) {
    return work.children
  }
  if (work.sibling) {
    return work.sibling
  }

  return work.parent?.sibling || null

}