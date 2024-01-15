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
let root: FiberNode | null = null;

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
  root = nextUnitOfWork
  requestIdleCallback(workLoop)
}


export const workLoop = (deadline: IdleDeadline) => {
  let shouldYeild = false;

  while (!shouldYeild && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1
  }

  if(!nextUnitOfWork && root) {
    commitRoot(root)
  }

  requestIdleCallback(workLoop)
}

function commitRoot(fiber: FiberNode) {
  commitWork(fiber.children)
  root = null
}

function commitWork(fiber: FiberNode | null) {
  if (!fiber) return;
  const domParent = fiber.parent?.dom
  if (domParent) {
    domParent.appendChild(fiber.dom!)
  }
  commitWork(fiber.children)
  commitWork(fiber.sibling)
}

function createDom(type: string) {
  return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom: HTMLElement | Text, props: FiberNode["props"]) {
  for (let key in props) {
    if (key !== "children") {
      (dom as any)[key] = props[key];
    }
  }
};
// 把dom树转换为链表
// 1. 创建dom树和添加props
// 2. 把dom树转换为链表: 
function performUnitOfWork(fiber: FiberNode | null) {
  if (!fiber) return null;
  // 1.挂载dom
  if (!fiber?.dom) {
    fiber.dom = createDom(fiber!.type || "div")
    const dom = fiber.dom;
    // 遍历props
    updateProps(dom, fiber.props);
    // 把dom添加到父节点
    (fiber.parent?.dom as HTMLElement)?.append(dom);
  }


  // 转换为链表, 从这棵树的children开始
  const children = fiber.props.children
  let prevSibling: FiberNode | null = null
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 构建fiber节点
    const newFiber: FiberNode = {
      type: child.type,
      props: child.props,
      parent: fiber,
      children: null,
      sibling: null,
      dom: null,
    }
    if (prevSibling) {
      // 如果有上一个节点, 把上一个节点的sibling设置为当前节点
      prevSibling.sibling = newFiber
    } else {
      // 如果没有上一个节点, 把当前节点设置为children
      fiber.children = newFiber
    }
    // 把当前节点设置为上一个节点
    prevSibling = newFiber
  }

  // 找到下一个工作单元
  if (fiber.children) {
    return fiber.children
  }
  if (fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling || null

}