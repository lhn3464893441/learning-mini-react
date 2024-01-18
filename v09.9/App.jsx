import React from "./core/React.jsx";

// 实现新旧节点替换
let num = 10
let props = { id:'app1' }
function Counter() {
    function handleClick() {
        num++
        props = {}
        React.update()
    }
    return (
        <div>
            count:{num}
            <button onClick={handleClick}>click</button>
        </div>
    )
}


function App() {
    return (
        <div {...props} >
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