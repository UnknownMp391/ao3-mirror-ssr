import { ref } from 'vue'
import { defineStore } from 'pinia'

import { escapeAndFormatText } from '../utils.js'

import { useApiStore } from '@/stores/api.js'

export const useWorkReadState = defineStore('workRead', () => {
	const api = useApiStore()
	const id = ref(null)
	const summary = ref(null)
	const pesud = ref(null)
	const title = ref(null)
	const text = ref(null)
	const publishedTime = ref(null)
	const state = ref('')
	function setData(data) {
		id.value = data.workId
		title.value = data.title
		summary.value = [escapeAndFormatText(data.summary)]
		pesud.value = data.pesud
		text.value = data.text.split('\n\n')
	}
	async function loadWork(target) {
		if (target == id.value || state.value == 'loading') return
		state.value = 'loading'
		const result = await api.getWork(target)
		if (result.status == 200) {
			setData(result.data)
			state.value = 'ready'
		} else {
			id.value = target
			state.value = import.meta.env.SSR ? 'ssrnotfound' : 'notfound'
		}
	}
	return {
		id,
		title,
		summary,
		pesud,
		text,
		publishedTime,
		state,
		setData,
		loadWork
	}
})
