import React from "./core/React.jsx";
// 优化更新，update只更新当前组件和子组件
let focount = 1
let bar = 'bar'
function Foo() {
    const [focount, setCount] = React.useState(10)
    const [bar, setBar] = React.useState('bar')
    function handleClick() {
        setCount((c)=> c + 1)
        setBar((s)=> s + 'bar')
    }
    return (
        <div >
            fooNum：{focount}
            <div>
                {bar}
            </div>
            <button onClick={handleClick}>click</button>
        </div>
    );
}

function App() {
    return (
        <div >
            <Foo></Foo>
        </div>
    );
}

export default App