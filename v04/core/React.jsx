
let workOfUnit = null
function render(container, el) {
    workOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
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


function workLoop(IdleDeadline) {

  let shouldIn = true

  while(shouldIn && workOfUnit) {
    workOfUnit = perOfworkOfUnit(workOfUnit)
    shouldIn = IdleDeadline.timeRemaining() > 1
  }

  requestIdleCallback(workLoop)

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
function initChildList(work) {
    const children = work.props.children
    // 上一个子组件
    let prevChild = null
    children.forEach((child, index) => {
        // 将子组件数据放入链表对象中
        const newWork = {
            type: child.type,
            props: child.props,
            child: null,
            parent: work, //将传入组件设置为链表对象的父级
            sibline: null,
            dom: null
        }
        if(index === 0) {
            // 把第一个设为传入组件的子组件
            work.child = newWork
        } else {
            // 将当前子组件设置为上一子组件的兄弟组件
            prevChild.sibline = newWork
        }
        // 将当前子组件设为上一个子组件，下次循环时将下个子组件设为当前子组件的兄弟
        prevChild = newWork
    })
}

function perOfworkOfUnit(work) {
    // dom是work(组件)的容器
    if (!work.dom) {
        // 创建dom
        const dom = (work.dom = createDom(work.type, work.props?.nodeValue))
        // 将dom加入传入组件的父组件中
        work.parent.dom.append(dom)
        // 处理props
        updateProps(dom, work.props)
    }
    
    
    // // 构建链表
    initChildList(work)


    // 返回下一个要执行的任务
    // 如果有子组件就先处理子组件
    if (work.child) {
        return work.child
    }

    // 如果没有子组件就处理兄弟组件
    if (work.sibline) {
        return work.sibline
    }

    return work.parent?.sibline
}

requestIdleCallback(workLoop)

const React = {
    render,
    createElement
}

export default React