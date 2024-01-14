import React from "./React.js"
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