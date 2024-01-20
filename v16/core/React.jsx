
let nextWorkOfUnit = null
// work in progress
let wipRoot = null
let wipFiber = null
let deletions = []
function render(container, el) {
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    }
    nextWorkOfUnit = wipRoot
}

let stateHooks = null;
let stateHookIndex = null;
function useState(initial) {
    let currentFiber = wipFiber
    let oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]
    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : []
    }

    stateHook.queue.forEach((action)=>{
        stateHook.state = action(stateHook.state)
    })

    stateHook.queue = []
    stateHookIndex++
    stateHooks.push(stateHook)

    currentFiber.stateHooks = stateHooks

    function setState(action) {
        const eagerState = typeof action === 'function' ? action(stateHook.state) : action

        if(stateHook.state === eagerState) return

        stateHook.queue.push(typeof action === 'function' ? action : () => action)
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }
        nextWorkOfUnit = wipRoot
    }

    return [stateHook.state, setState]

}

let effectHooks = null;
function useEffect(callback, deps) {
    const effectHook = {
        callback,
        deps,
        cleanup: undefined
    }
    effectHooks.push(effectHook)


    wipFiber.effectHooks = effectHooks
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

// function createElement(type, props, ...children) {
//     const arr = []
//     let doCreate = true
//     children.map((child) => {
//         console.log(child);
//         if(doCreate){
//             if(child){
//                 const isTextNode = typeof child === 'string' || typeof child === 'number'
//                 arr.push(isTextNode ? createTextNode(child) : child)
//             } else {
//                 doCreate = false
//             }
//         } else {
//             doCreate = true
//         }
//     })
//     return {
//         type: type,
//         props: {
//             ...props,
//             children: arr
//         },
        
//     }
// }

function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map((child) => {
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

    if(fiber.tag === 'update') {
        updateProps(fiber.dom, fiber.props, fiber.alternate.props)
    } else if(fiber.tag === 'placement') {
        // 把传入对象的dom设置给父级dom
        if(fiber.dom){
            fiberParent.dom.append(fiber.dom)
        }
    }
    commitFiber(fiber.child)
    commitFiber(fiber.sibling)
}


function fiberLoop(IdleDeadline) {

    let shouldIn = true

    while(shouldIn && nextWorkOfUnit) {
        nextWorkOfUnit = perOffiberOfUnit(nextWorkOfUnit)

        if (nextWorkOfUnit?.type === wipRoot?.sibling?.type) {
            nextWorkOfUnit = undefined
        }

        shouldIn = IdleDeadline.timeRemaining() > 1
    }
    //  统一提交
    if(!nextWorkOfUnit && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(fiberLoop)

}

function commitRoot() {
    deletions.forEach(deleteComponent)
    //把el传入
    commitFiber(wipRoot.child)
    commitEffectHooks()
    // 只执行一次
    wipRoot = null
    deletions = []
}

function commitEffectHooks() {
    
    function run(fiber) {
        if(!fiber) return

        if(!fiber.alternate) {
            fiber.effectHooks?.forEach((hook)=>{
                hook.cleanup = hook.callback()
            })
        } else {
            fiber.effectHooks?.forEach((newHook, index)=>{
                let oldEffectHook = fiber.alternate?.effectHooks[index]
                const needUpdate = oldEffectHook?.deps.some((oldDep, i)=>{
                    return oldDep !== newHook.deps[i]
                })

                needUpdate && (newHook.cleanup = newHook?.callback())
            })
        }


        run(fiber.child)
        run(fiber.sibling)
    }

    function runCleanUp(fiber) {
        if(!fiber) return


        fiber.alternate?.effectHooks?.forEach((hook)=>{
            if(hook.deps.length > 0)  {
                hook.cleanup && hook.cleanup()
            }
        })

        runCleanUp(fiber.child)
        runCleanUp(fiber.sibling)
    }


    runCleanUp(wipRoot)
    run(wipRoot)
}


// 创建dom
function createDom(type) {
    return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

// 处理props
function updateProps(dom, nextProps, oldProps) {
    Object.keys(oldProps).forEach((key)=>{
        if(key !== 'children') {
            // 查找新dom的props中有没有删除的属性，在旧props中同样删除
            if(!(key in nextProps)){
                dom.removeAttribute(key)
            }
        }
    })
    Object.keys(nextProps).forEach((key)=>{
        if(key !== 'children') {
            if(nextProps[key] !== oldProps[key]) {
                if(key.startsWith('on')) {
                    const type  = key.slice(2).toLocaleLowerCase()
                    // 新增事件时删除旧事件，防止重复调用
                    dom.removeEventListener(type, oldProps[key])
                    dom.addEventListener(type, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }
            }
        }
    })
}

// function deleteComponent(fiber) {
//     let fDom = fiber.dom
//     while(!fDom){
//         fDom = fiber.child.dom
//     }
//     fiber.parent.dom.removeChild(fDom)
// }

function deleteComponent(fiber) {
    if(fiber.dom){
        let fiberParent = fiber.parent;
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent;
        }
        fiberParent.dom.removeChild(fiber.dom)
    } else {
        deleteComponent(fiber.child)
    }
}

//  构建链表
function reconcileChildren(fiber, children) {
    // 上一个子组件
    let prevChild = null
    // 得到Root，但需要获取Root下面的App
    let oldFiber = fiber.alternate?.child
    children.forEach((child, index) => {
        // 如果两个dom的type一样则为更新
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
                dom: oldFiber.dom, // 更新不创建dom
                alternate: oldFiber,
                tag: 'update'
            }
        } else {
            // 在创建子节点时判断是否为false
            if(child) {
                // 将子组件数据放入链表对象中
                newFiber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    parent: fiber, //将传入组件设置为链表对象的父级
                    sibling: null,
                    dom: null,
                    tag: 'placement'
                }
            }
            // 如果老节点和新节点标签不一样，还有值，则删除老节点换成新节点
            if (oldFiber) {
                deletions.push(oldFiber)
            }
        }
        // 如果oldFiber有值则是更新，将下一个要处理的同级dom设置为当前oldFiber
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if(index === 0) {
            // 把第一个设为传入组件的子组件
            fiber.child = newFiber
        } else {
            // 将当前子组件设置为上一子组件的兄弟组件
            prevChild.sibling = newFiber
        }
        // 如果当前组件不存在就等待下一个存在的组件
        if(newFiber){
            // 将当前子组件设为上一个子组件，下次循环时将下个子组件设为当前子组件的兄弟
            prevChild = newFiber
        }
    })
    // 如果新链表短，剩余子节点在这里删除
    while (oldFiber) {
        deletions.push(oldFiber)
        // 删除后指向下一个节点
        oldFiber = oldFiber.sibling
    }
}

function updateFunctionComponent(fiber) {
    stateHooks = []
    stateHookIndex = 0
    effectHooks = []
    wipFiber = fiber
    // 构建链表
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
    // dom是fiber(组件)的容器
    if (!fiber.dom) {
        // 创建dom
        const dom = (fiber.dom = createDom(fiber.type))
        // 处理props
        updateProps(dom, fiber.props, {})
    }
    // 构建链表
    const children = fiber.props.children
    reconcileChildren(fiber, children)
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
    useState,
    useEffect,
    createElement
}

export default React