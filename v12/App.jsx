import React from "./core/React.jsx";
// 优化更新，update只更新当前组件和子组件

let focount = 1
function Foo() {
    console.log('foo return');
    // 需要再创建组件时候获取节点
    const update = React.update()
    function handleClick() {
        // 方法里获取节点会获取到下一个获取节点
        focount++
        update()
    }
    return (
        <div >
            fooNum：{focount}
            <button onClick={handleClick}>click</button>
        </div>
    );
}
let bocount = 1
function Boo() {
    console.log('boo return');
    const update = React.update()
    function handleClick() {
        bocount++
        update()
    }
    return (
        <div >
            booNum：{bocount}
            <button onClick={handleClick}>click</button>
        </div>
    );
}


let num = 1
function App() {
    console.log('app return');
    const update = React.update()
    function handleClick() {
        num++
        update()
    }
    return (
        <div >
            appNum：{num}
            <button onClick={handleClick}>click</button>
            <Foo></Foo>
            <Boo></Boo>
        </div>
    );
}

export default App