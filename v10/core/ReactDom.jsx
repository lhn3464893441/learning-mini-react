import React from "./React.jsx"
const ReactDom = {
    createRoot(container) {
        return {
            render(el) {
                React.render(container, el)
            }
        }
    }
}

export default ReactDom