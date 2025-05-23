import { defineStore } from 'pinia'
import { useApiRequest } from '../composables/apiRequest'

export const useApiStore = defineStore('api', () => {
	async function getWork(workId, chapterId) {
		const path = chapterId ? `work/${workId}/${chapterId}` : `work/${workId}`
		const { execute } = useApiRequest('GET', path)
		return await execute()
	}

	async function postData(url, payload) {
		const { execute } = useApiRequest('POST', url, payload)
		return await execute()
	}

	return {
		getWork,
		postData,
	}
})
