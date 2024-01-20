import React from "./core/React.jsx";

function Foo() {
    const [focount, setCount] = React.useState(10)
    const [bar, setBar] = React.useState('bar')
    function handleClick() {
        setCount((c)=>c + 1)
        setBar((s)=>s + 'bar')
    }
    
    React.useEffect(()=>{
        console.log('heiheihei:' + focount);
        return ()=>{
            console.log('clineup0:' + focount);
        }
    },[])
    React.useEffect(()=>{
        console.log('heiheihei:' + focount);
        return ()=>{
            console.log('clineup1:' + focount);
        }
    },[focount])
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

let num = 1
function App() {
    return (
        <div >
            <Foo></Foo>
        </div>
    );
}

export default App