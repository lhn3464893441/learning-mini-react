import React from "./core/React.jsx";
// 删除多余子节点
let isShow = false
function Counter() {
    
    const bbb = (
        <div>
            bbb
        </div>
    )

    const foo = (
        
        <div>
            aaa
            <div>
                child
            </div>
            <div>
                child2
                <div>
                    child2.1
                </div>
                <div>
                    child2.2
                </div>
                <div>
                    child3.1
                    <div>
                        child3.1.1
                    </div>
                    <div>
                        child3.1.2
                    </div>
                </div>
            </div>
        </div>
    )
    function handleClick() {
        isShow = !isShow
        React.update()
    }
    return (
        <div>
            <div>{isShow ? foo : bbb}</div>
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