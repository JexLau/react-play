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


const workLoop = (deadline: IdleDeadline) => {
  let shouldYeild = false;

  while (!shouldYeild && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && root) {
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
  let fiberParent = fiber.parent
  while (!fiberParent?.dom) {
    fiberParent = fiberParent?.parent || null
  }
  if (fiber.dom) {
    fiberParent?.dom?.appendChild(fiber.dom)
  }

  commitWork(fiber.children)
  commitWork(fiber.sibling)
}

function isFunctionComponent(type: string) {
  return typeof type === "function"
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

function initChildren(fiber: FiberNode, children: ReactElement[]) {
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
}

function renderFunctionComponent(fiber: FiberNode) {
  const children = [(fiber.type as Function)(fiber.props)]
  initChildren(fiber, children)
  return children
}

function renderHostComponent(fiber: FiberNode) {
  if (!fiber?.dom) {
    fiber.dom = createDom(fiber!.type as string)
    const dom = fiber.dom;
    // 遍历props
    updateProps(dom, fiber.props);
  }
  const children = fiber.props.children
  initChildren(fiber, children)
  return fiber.children
}

function performUnitOfWork(fiber: FiberNode | null) {
  if (!fiber) return null;
  // 如果是函数组件, 调用函数, 获取返回值, 否则直接创建dom
  if (isFunctionComponent(fiber.type as string)) {
    renderFunctionComponent(fiber)
  } else {
    renderHostComponent(fiber)
  }
  
  if (fiber.children) {
    return fiber.children
  }

  let nextFiber: FiberNode | null = fiber
  while (nextFiber) {
    if (nextFiber?.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

  return null
}