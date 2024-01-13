import { render } from "./React";
import { ReactElement } from "./typings";

const ReactDom = {
  createRoot: (element: HTMLElement) => {
    return {
      render: (component: ReactElement) => {
        render(component, element);
      },
    };
  },
};

export default ReactDom;