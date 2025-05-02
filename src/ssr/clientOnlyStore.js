import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useClientOnlyStore = defineStore('ClientOnly', () => {
	const isClient = ref(false)
	function setClient() { isClient.value = true }
	return {
		isClient,
		setClient
	}
})
