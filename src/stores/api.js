import { defineStore } from 'pinia'
import { useApiRequest } from '../composables/apiRequest.js'

export const useApiStore = defineStore('api', () => {
	async function getWork(workId, chapterId) {
		const path = chapterId ? `work/${workId}/${chapterId}` : `work/${workId}`
		const { execute } = useApiRequest('GET', path)
		return await execute()
	}

	async function workSimpleSearch(keyword, page = 1) {
		const { execute } = useApiRequest('GET', 'search/simple', { keyword, page })
		return await execute()
	}

	return {
		getWork,
		workSimpleSearch
	}
})
