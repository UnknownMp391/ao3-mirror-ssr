import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useApiStore } from '@/stores/api.js'

export const useSimpleSearchState = defineStore('simpleSearch', () => {
	const api = useApiStore()
	const keyword = ref('')
	const result = ref([])
	const count = ref(0)
	const pageCount = ref(0)
	const currentPage = ref(0)
	const state = ref(null)
	async function load() {
		if (pageCount.value && currentPage.value >= pageCount.value){ state.value = 'finish'; return }
		state.value = 'loading'
		let res = await api.workSimpleSearch(keyword.value, currentPage.value)
		res = res.data
		if (res.code == 0) {
			currentPage.value++
			if( pageCount.value ) {
				if (currentPage.value > pageCount.value) currentPage.value = pageCount.value
			} else {
				pageCount.value = res.pageCount
			}
			count.value = res.count
			state.value = import.meta.env.SSR ? 'ssrready' : 'ready'
			result.value.push(...res.works)
		} else if (res.code == 1) {
			if ( count.value ) {
				state.value = 'finish'
			} else {
				currentPage.value = 0
				state.value = 'notfound'
			}
		}
	}
	async function start(key) {
		if (key == keyword.value) return
		keyword.value = key
		result.value = []
		state.value = 'loading'
		currentPage.value = 1
		pageCount.value = 0
		await load()
	} 
	
	return {
		keyword,
		result,
		count,
		pageCount,
		currentPage,
		state,
		load, start
	}
})
