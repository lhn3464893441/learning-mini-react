
let fiberOfUnit = null
let root = null
function render(container, el) {
    fiberOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
    root = fiberOfUnit
}


function createTextNode(text) {
    return {
        type:'TEXT_ELEMENT',
        props:{
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
            children: children.map((child)=>{
                return typeof child === 'string' ? createTextNode(child) : child
            })
        },
        
    }
}



// 统一提交
function commitFiber(fiber) {
    if (!fiber) return
    // 把传入对象的dom设置给父级dom
    fiber.parent.dom.append(fiber.dom)
    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}


function fiberLoop(IdleDeadline) {

    let shouldIn = true

    while(shouldIn && fiberOfUnit) {
        fiberOfUnit = perOffiberOfUnit(fiberOfUnit)
        shouldIn = IdleDeadline.timeRemaining() > 1
    }
    //  统一提交
    if(!fiberOfUnit && root) {
        //把el传入
        commitFiber(root.child)
        // 只执行一次
        root = null
    }

    requestIdleCallback(fiberLoop)

}

// 创建dom
function createDom(type, value) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode(value) : document.createElement(type)
}

// 处理props
function updateProps(dom, props) {
    Object.keys(props).forEach((key)=>{
        if(key !== 'children') {
            dom[key] = props[key]
        }
    })
}

//  构建链表
function initChildList(fiber) {
    const children = fiber.props.children
    // 上一个子组件
    let prevChild = null
    children.forEach((child, index) => {
        // 将子组件数据放入链表对象中
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber, //将传入组件设置为链表对象的父级
            sibling: null,
            dom: null
        }
        if(index === 0) {
            // 把第一个设为传入组件的子组件
            fiber.child = newFiber
        } else {
            // 将当前子组件设置为上一子组件的兄弟组件
            prevChild.sibling = newFiber
        }
        // 将当前子组件设为上一个子组件，下次循环时将下个子组件设为当前子组件的兄弟
        prevChild = newFiber
    })
}

function perOffiberOfUnit(fiber) {
    // dom是fiber(组件)的容器
    if (!fiber.dom) {
        // 创建dom
        const dom = (fiber.dom = createDom(fiber.type, fiber.props?.nodeValue))
        // 处理props
        updateProps(dom, fiber.props)
    }
    
    
    // // 构建链表
    initChildList(fiber)


    // 返回下一个要执行的任务
    // 如果有子组件就先处理子组件
    if (fiber.child) {
        return fiber.child
    }

    // 如果没有子组件就处理兄弟组件
    if (fiber.sibling) {
        return fiber.sibling
    }

    return fiber.parent?.sibling
}

requestIdleCallback(fiberLoop)

const React = {
    render,
    createElement
}

export default React