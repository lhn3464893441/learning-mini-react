
let fiberOfUnit = null
let root = null
let oldRoot = null
function render(container, el) {
    fiberOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
    root = fiberOfUnit
}

function update() {
    fiberOfUnit = {
        dom: oldRoot.dom,
        props: oldRoot.props,
        alternate: oldRoot // 将旧root存入alternate 用于构建更新dom链表
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
                const isTextNode = typeof child === 'string' || typeof child === 'number'
                return isTextNode ? createTextNode(child) : child
            })
        },
        
    }
}




// 统一提交
function commitFiber(fiber) {
    if (!fiber) return
    
    // 由于function component没有dom，判断dom是否存在，如果不存在就一直往上级找
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }

    if (fiber.tag === 'update') {
        updateProps(fiber.dom, fiber.props, fiber.alternate.props)
    } else if(fiber.tag === 'add') {
        // 把传入对象的dom设置给父级dom
        if(fiber.dom) {
            fiberParent.dom.append(fiber.dom)
        }
    }
    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}


function fiberLoop(IdleDeadline) {

    let shouldIn = true

    while(shouldIn && fiberOfUnit) {
        console.log('fiberOfUnit');
        console.log(fiberOfUnit);
        fiberOfUnit = perOffiberOfUnit(fiberOfUnit)
        shouldIn = IdleDeadline.timeRemaining() > 1
    }
    //  统一提交
    if(!fiberOfUnit && root) {
        //把el传入
        commitFiber(root.child)
        // 将处理完毕的root存起来等待更新
        oldRoot = root
        // 只执行一次
        root = null
    }

    requestIdleCallback(fiberLoop)

}

// 创建dom
function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

// 处理props
function updateProps(dom, nextProps, oldProps) {
    Object.keys(oldProps).forEach((key)=>{
        if(key !== 'children') {
            // 对比新旧pops 就有新无则将已创建的dom中对应属性删除
            if (!(key in nextProps)) {
                dom.removeAttribute(key)
            }
        }
    })
    Object.keys(nextProps).forEach((key)=>{
        if(key !== 'children') {
            // 如果新旧props有出入就直接设置成新的
            if(oldProps[key] !== nextProps[key]){
                if(key.startsWith('on')) {
                    const type  = key.slice(2).toLocaleLowerCase()
                    // 删除旧的事件后再创建新的事件，避免重复触发
                    dom.removeEventListener(type, oldProps[key])
                    dom.addEventListener(type, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }
            }
        }
    })
}

//  构建链表
function initChildList(fiber, children) {
    // 上一个子组件
    let prevChild = null
    // 将Root中的App取出并判断是否为更新
    let oldFiber = fiber.alternate?.child
    children.forEach((child, index) => {
        // oldFiber是否为空后对比divtype
        const isSameType = oldFiber && oldFiber.type === child.type
        let newFiber = null
        if(isSameType) {
            // 将子组件数据放入链表对象中
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber, //将传入组件设置为链表对象的父级
                sibling: null,
                dom: oldFiber.dom, // 更新时指向旧dom
                alternate: oldFiber, // 将旧数据存入alternate
                tag: 'update' // 标记，用来判断是更新还是新增
            }
        } else {
            // 将子组件数据放入链表对象中
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                parent: fiber, //将传入组件设置为链表对象的父级
                sibling: null,
                dom: null, 
                tag: 'add'
            }
        }

        // 如果oldFiber有值则将oldFiber的sibling变为oldFiber
        if(oldFiber){
            oldFiber = oldFiber.sibling
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

function updateFunctionComponent(fiber) {
    // 构建链表
    const children = [fiber.type(fiber.props)]
    initChildList(fiber, children)
}

function updateHostComponent(fiber) {
    // dom是fiber(组件)的容器
    if (!fiber.dom) {
        // 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        // 处理props
        if (fiber.props) {
            updateProps(dom, fiber.props, {})
        }
    }
    // 构建链表
    const children = fiber.props.children
    initChildList(fiber, children)
}

function perOffiberOfUnit(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function'

    // 如果是function component则无需创建dom
    if(isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    
    // 返回下一个要执行的任务
    // 如果有子组件就先处理子组件
    if (fiber.child) {
        return fiber.child
    }

    
    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}

requestIdleCallback(fiberLoop)

const React = {
    render,
    update,
    createElement
}

export default React