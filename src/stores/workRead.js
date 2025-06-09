import { ref } from 'vue'
import { defineStore } from 'pinia'

import { escapeAndFormatText } from '../utils.js'

import { useApiStore } from '@/stores/api.js'

export const useWorkReadState = defineStore('workRead', () => {
	const api = useApiStore()
	const id = ref(null)
	const cid = ref(null)
	const summary = ref(null)
	const pseud = ref(null)
	const title = ref(null)
	const text = ref(null)
	const state = ref('')
	const publishedTime = ref(null)
	const completedTime = ref(null)
	const updatedTime = ref(null)
	const wordCount = ref(0)
	const kudoCount = ref(0)
	const hitCount = ref(0)
	const category = ref([])
	const fandom = ref([])
	const lang = ref(null)
	const chapters = ref([])
	const chapterIndex = ref(null)
	const chapterStat = ref(null)
	function setData(data) {
		cid.value = data.chapterId
		id.value = data.workId
		title.value = data.title
		summary.value = data.summary ? escapeAndFormatText(data.summary) : null
		pseud.value = data.pseud
		text.value = data.text
		publishedTime.value = data.stats.publishedTime
		completedTime.value = data.stats.completedTime
		updatedTime.value = data.stats.updatedTime
		wordCount.value = data.stats.wordCount
		kudoCount.value = data.stats.kudoCount
		hitCount.value = data.stats.hitCount
		category.value = data.category
		fandom.value = data.fandom
		lang.value = data.lang
		chapters.value = data.chapters || []
		chapterIndex.value = data.chapterIndex ?? null
		chapterStat.value = data.stats.chapter
	}
	async function loadWork(target, targetc) {
		const itarget = parseInt(target)
		if (isNaN(itarget)) {
			console.log('a')
			state.value = 'errformat'
			return
		}
		const itargetc = parseInt(targetc)
		if (
			itarget === id.value &&
			(itargetc === cid.value || (isNaN(itargetc) && cid.value === null)) &&
			state.value !== 'loading'
		) return
		id.value = itarget
		cid.value = isNaN(itargetc) ? null : itargetc
		state.value = 'loading'
		const result = await api.getWork(id.value, cid.value)
		if (result.status == 200) {
			setData(result.data)
			state.value = 'ready'
		} else if (result.status == 404) {
			state.value = import.meta.env.SSR ? 'ssrnotfound' : 'notfound'
		} else if (result.status == 401) {
			state.value = 'unauth'
		} else if (result.status == 500) {
			state.value = 'error'
		}
	}
	return {
		id, cid,
		title, summary,
		pseud, text, state,
		publishedTime,
		completedTime,
		updatedTime,
		wordCount, kudoCount, hitCount,
		category, fandom, lang,
		chapters, chapterIndex, chapterStat,
		setData, loadWork
	}
})
