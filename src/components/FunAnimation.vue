<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const frames = [`
✋ 😭 🤚
 \\  | /
  ++++
   ++
   ++
  /  \\`,
`

✋ 😭 🤚
 \\ |  /
  ++++
  /  \\
`]

const currentFrame = ref(frames[0])
let animationInterval = null
let count = ref(0)

onMounted(() => {
  // 初始显示第一帧
  currentFrame.value = frames[0]
  // 设置动画间隔
  animationInterval = setInterval(() => {
    currentFrame.value = currentFrame.value === frames[0] 
      ? frames[1] 
      : frames[0]
  }, 250)
})
onBeforeUnmount(() => {
  // 组件卸载前清除定时器
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
})

const incr = () => count.value++
</script>
<template>
    <pre style="line-height:1 ;" class="no-select" @click="incr() > 5 ? $router.push('/developer') : null">
		{{ currentFrame }}
    </pre>
</template>
