import React from "./core/React.jsx";

let isShow = true
// 实现新旧节点替换
const bbb = (
    <div>
        bbb
    </div>
)

function Faa() {
    return <p>
    aaa
</p>
}

function Counter() {
    function handleClick() {
        isShow = !isShow
        React.update()
    }
    return (
        <div>
            <div>{isShow ? <Faa></Faa> : bbb}</div>
            <button onClick={handleClick}>click</button>
        </div>
    )
}


function App() {
    return (
        <div >
            app1
            <Counter></Counter>
        </div>
    );
}

// const App = (
//     <div id="app1" >
//         app1
//         <Counter></Counter>
//     </div>
// )

// const App = React.createElement('div',{id:'app'},'app', React.createElement('div',{id:'app2'},'app2','app2.1'))

export default App