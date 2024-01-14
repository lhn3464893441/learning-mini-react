let id = 1
function work(IdleDeadline) {
  id++

  let shouldIn = true
  while(shouldIn) {
    console.log('任务执行次数：',id)

    shouldIn = IdleDeadline.timeRemaining() > 1

  }

  requestIdleCallback(work)

}

requestIdleCallback(work)