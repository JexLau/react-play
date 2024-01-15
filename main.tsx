import App from './App.tsx';
import ReactDom from './core/client.ts';
import * as React from "./core/React"

ReactDom.createRoot(document.getElementById('root')!).render(<App />);