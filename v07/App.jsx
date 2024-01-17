import React from "./core/React.jsx";

function Counter({num}) {
    function handleClick() {
        console.log('click');
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
        <div id="app1" >
            app1
            <Counter num={10}></Counter>
            <Counter num={20}></Counter>
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