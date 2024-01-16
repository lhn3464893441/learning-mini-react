let root = null
let nextFiberUnit = null
function render(container, el) {
    nextFiberUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
    root = nextFiberUnit
}

function createTextNode(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => {
                const isTextNode = typeof child === 'string' || typeof child === 'number'
                return isTextNode? createTextNode(child) : child
            })
        }
    }
}

function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom, props) {
    Object.keys(props).forEach((key)=>{
        // 不处理children
        if(key !== 'children') {
            dom[key] = props[key]
        }
    })
}


function initLianBiao(fiber, children) {
    
    let sygFiber = null
    children.forEach((child, index)=>{
        const newFiber = {
            dom: null,
            parent: fiber,
            type: child.type,
            props: child.props,
            sibling: null,
            child: null
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            sygFiber.sibling = newFiber
        }
        sygFiber = newFiber
    })
}

function updateFunctionComponent(fiber) {
    // function component 没有dom，直接找他下级 在type里加()调用并传入props
    const children = [fiber.type(fiber.props)]
    initLianBiao(fiber, children)
}

function updateHostComponent(fiber) {
    if(!fiber.dom) {
        let dom = (fiber.dom = createDom(fiber.type))
        updateProps(fiber.dom, fiber.props)
    }
    // 构建链表
    const children = fiber.props.children
    initLianBiao(fiber, children)
}

function shuZhuanLian(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function'
    if (isFunctionComponent) {
        // function组件
        updateFunctionComponent(fiber)
    } else {
        // 普通组件
        updateHostComponent(fiber)
    }

    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while (nextFiber) {
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }


}

function commitFiber(fiber) {
    if(!fiber) return
    let fiberParent = fiber.parent
    // function Component没有dom需要向上找
    while(!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }
    // function Component没有dom需要过滤的调，不然会出null
    if(fiber.dom) {
        fiberParent.dom.append(fiber.dom)
    }
    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}

function fiberLoop(IdleDeadline) {
    let haveTime =  IdleDeadline.timeRemaining() > 1
    // 如果浏览器有时间就把dom树转成链表
    if(haveTime && nextFiberUnit) {
        nextFiberUnit = shuZhuanLian(nextFiberUnit)
        haveTime =  IdleDeadline.timeRemaining() > 1
    }

    // 转换完毕统一添加到页面
    if (!nextFiberUnit) {
        commitFiber(root.child)
        root = null
    }

    requestIdleCallback(fiberLoop)
}

requestIdleCallback(fiberLoop)

const React = {
    render,
    createElement
}

export default React