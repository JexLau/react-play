import * as React from "./core/React"

let count = 10;
const props = { id: 333 }
function Counter({ number, bool, }: { number: number, bool?: boolean }) {
  const update = () => {
    count++;
    props && (props.id = 444)
    React.updateDom()
  }

  return <div {...props} onClick={() => update()}>count:{count}{bool}</div>
}

function Counter2() {
  return <Counter number={30} />
}

const App = () => {
  return <div>
    <Counter number={10} bool />
    {/* <Counter number={20} bool /> */}
    {/* <Counter2 /> */}
  </div>
}

export default App