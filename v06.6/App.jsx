import React from './core/React'

function Counter({num}) {
    return (
        <div>
            count:{num}
        </div>
    )
}

function App() {
    return (
        <div>
            app1
            <Counter num={10}></Counter>
            <Counter num={20}></Counter>
        </div>
    )
}

export default App