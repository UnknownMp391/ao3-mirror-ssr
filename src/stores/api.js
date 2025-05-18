import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useSSRContext } from 'vue'
import axios from 'axios'

import { objectToQueryString, getCookie, setCookie } from '@/utils.js'

const apiMapping = {
	'': ['http://localhost:28001/','/api/']
}

function replaceUrl(url) {
	return url
		.replace('{{hostname}}',window.location.hostname)
		.replace('{{port}}',window.location.port)
		.replace('{{protocol}}',window.location.protocol)
}

export const useApiStore = defineStore('api', () => {
	let host = import.meta.env.SSR ? useSSRContext().host : window.location.host
	let entry = apiMapping[host] ? apiMapping[host] : apiMapping['']
	let endpoint = import.meta.env.SSR ? entry[0] : replaceUrl(entry[1])
	//console.log('Entry point:', endpoint)
	var inited = false
	var initializing = false
	async function apiGet(url, data) {
		const realURL = data 
			? `${endpoint}${url}?${objectToQueryString(data)}`
			: `${endpoint}${url}`
		try {
			let start = Date.now()
			const response = await axios.get(realURL)
			let stop = Date.now()
			return {
				status: response.status,
				data: response.data,
				start, stop,
				duration: stop - start,
				isSSR: import.meta.env.SSR
			}
		} catch (error) {
			if (error.response) {
				return {
					status: error.response.status,
					data: error.response.data,
					isSSR: import.meta.env.SSR
				}
			} else {
				return {
					status: -1,
					data: null
				}
			}
		}
	}
	async function apiPost(url, data) {
		const realURL = `${endpoint}${url}`;
		try {
			let start = Date.now()
			const response = await axios.post(realURL, data, {
				headers: { 'Content-Type': 'application/json' }
			})
			let stop = Date.now()
			return {
				status: response.status,
				data: response.data,
				start, stop,
				duration: stop - start,
				isSSR: import.meta.env.SSR
			}
		} catch (error) {
			if (error.response) {
				return {
					status: error.response.status,
					data: error.response.data,
					isSSR: import.meta.env.SSR
				}
			} else {
				return {
					status: -1,
					data: null
				}
			}
		}
	}
	async function init() {
		if (inited) return
		if (initializing) {
			while (initializing) {
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
			return
		}
		initializing = true
		inited = true
		initializing = false
		if (!import.meta.env.SSR) {
			console.log(`[API] Inited! endpoint: ${endpoint}`)
		}
	}
	async function reInit(){
		inited = false
		await init()
	}
	async function getWork(workId, chapterId) {
		if (chapterId) return await apiGet(`work/${workId}/${chapterId}`)
		return await apiGet(`work/${workId}`)
	}
	return {
		init,
		reInit,
		getWork
	}
})
