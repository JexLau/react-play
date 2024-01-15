import * as React from "./core/React"

function Counter({ number, bool}: {number: number, bool?: boolean}) {
  return <div>count: {number} {bool}</div>
}

function Counter2() {
  return <Counter number={30} />
}

const App = () => {
  return <div> hi-mini-react
    <Counter number={10} bool />
    <Counter number={20} bool />
    <Counter2 />
  </div>
}

export default App