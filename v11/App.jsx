import React from "./core/React.jsx";
// 优化更新代码
let isShow = false
function Counter() {
    
    const bbb = (
        <div>
            bbb
        </div>
    )
    function handleClick() {
        isShow = !isShow
        React.update()
    }
    return (
        <div>
            Counter
            {isShow && bbb}
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