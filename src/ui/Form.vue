<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

function handleSubmit(event) {
  event.preventDefault()
  const form = event.target
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())
  emit('submit', data, event)
}
</script>

<template>
  <form @submit="handleSubmit">
    <slot></slot>
  </form>
</template>

