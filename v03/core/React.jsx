function render(container, el) {
    console.log('el');
    console.log(el);
    const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode(el.props.nodeValue) : document.createElement(el.type)

    Object.keys(el.props).forEach((key)=>{
        if(key !== 'children') {
            dom[key] = el.props[key]
        }
    })

    if(el.children) {
        el.children.map((child)=>{
            child = typeof child === 'string' ? createTextNode(child) : child
            render(dom, child)
        })
    }

    container.append(dom)
}


function createTextNode(text) {
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue: text
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type: type,
        props: {...props},
        children: children
    }
}

const React = {
    render,
    createElement
}

export default React