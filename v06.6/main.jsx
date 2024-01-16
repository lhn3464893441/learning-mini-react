import ReactDom from "./core/ReactDom.jsx";
import React from "./core/React";
import App from "./App.jsx";

ReactDom.createRoot(document.querySelector('#root')).render(<App></App>)