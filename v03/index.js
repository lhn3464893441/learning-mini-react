let id = 1
function workLoop(IdleDeadline) {
  id++

  let shouldIn = true
  while(shouldIn) {
    console.log('任务执行次数：',id)

    shouldIn = IdleDeadline.timeRemaining() > 1

  }

  requestIdleCallback(workLoop)

}

requestIdleCallback(workLoop)