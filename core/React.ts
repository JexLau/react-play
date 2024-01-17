import { FiberNode, ReactElement } from "./typings"

export const createElement = (type: string, props: object, ...children: ReactElement[] | string[]): ReactElement => {
  console.log('---------')
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
let wipRoot: FiberNode | null = null;
let currentRoot: FiberNode | null = null;

const workLoop = (deadline: IdleDeadline) => {
  let shouldYeild = false;

  while (!shouldYeild && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot(wipRoot)
  }

  requestIdleCallback(workLoop)
}

function commitRoot(fiber: FiberNode) {
  commitWork(fiber.children)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber: FiberNode | null) {
  if (!fiber) return;
  let fiberParent = fiber.parent
  while (!fiberParent?.dom) {
    fiberParent = fiberParent?.parent || null
  }
  if (fiber.effectTag === "UPDATE" && fiber.dom) {
    console.log('-------UPDATE', fiber.alternate?.props)
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else if (fiber.dom && fiber.effectTag === "PLACEMENT") {
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

function updateProps(dom: HTMLElement | Text, nextProps: FiberNode["props"], prevProps: FiberNode["props"] = {}) {
  // 1. 新的没有, 老的有, 删除
  for (let key in prevProps) {
    if (key !== "children") {
      if (!nextProps[key]) {
        (dom as HTMLElement).removeAttribute(key)
      }
    }
  }

  // 2. 新的有, 老的没有, 添加
  // 3. 新的有, 老的有, 更新
  for (let key in nextProps) {
    if (key !== "children") {
      if (prevProps[key] !== nextProps[key]) {
        if (key.startsWith("on")) {
          const eventName = key.slice(2).toLowerCase()
          dom.removeEventListener(eventName, prevProps[key])
          dom.addEventListener(eventName, nextProps[key])
        } else {
          (dom as any)[key] = nextProps[key];
        }
      }
    }
  }
};

function reconcileChildren(fiber: FiberNode, children: ReactElement[]) {
  let prevChild: FiberNode | null = null
  let oldFiber = fiber.alternate?.children || null
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const isSameType = !!(child && oldFiber && child.type === oldFiber.type)
    console.log("isSameType", isSameType, child.type, oldFiber?.type)
    let newFiber: FiberNode | null = null
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        children: null,
        sibling: null,
        dom: oldFiber?.dom || null,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    } else {
      // 构建fiber节点
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        children: null,
        sibling: null,
        dom: null,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (prevChild) {
      // 如果有上一个节点, 把上一个节点的sibling设置为当前节点
      prevChild.sibling = newFiber
    } else {
      // 如果没有上一个节点, 把当前节点设置为children
      fiber.children = newFiber
    }
    // 把当前节点设置为上一个节点
    prevChild = newFiber
  }
}

function renderFunctionComponent(fiber: FiberNode) {
  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
  return children
}

function renderHostComponent(fiber: FiberNode) {
  if (!fiber?.dom) {
    fiber.dom = createDom(fiber!.type as string)
    const dom = fiber.dom;
    // 遍历props
    updateProps(dom, fiber.props, fiber.alternate?.props);
  }
  const children = fiber.props.children
  reconcileChildren(fiber, children)
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

export const render = (element: ReactElement, container: HTMLElement) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    parent: null,
    sibling: null,
    children: null,
    alternate: null,
    effectTag: "PLACEMENT",
  }
  nextUnitOfWork = wipRoot
  requestIdleCallback(workLoop)
}

export function updateDom() {
  wipRoot = {
    dom: currentRoot!.dom,
    props: currentRoot!.props,
    alternate: currentRoot || null,
    parent: null,
    sibling: null,
    children: null,
    effectTag: null
  }

  nextUnitOfWork = wipRoot
}