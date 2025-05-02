import { ref } from 'vue'
import { defineStore } from 'pinia'

import { breakpoint } from 'mdui/functions/breakpoint.js'
import { observeResize } from 'mdui/functions/observeResize.js'

export const useMobileScreen = defineStore('deviceMobileScreen', () => {
	function _() { 
		if (import.meta.env.SSR) { return false }
		else { return breakpoint().down('md') ? true : false }
	}
	const isMobile = ref(_())
	if (!import.meta.env.SSR) {
		const observer = observeResize(document.body, (entry, obs) => {
			isMobile.value = _()
		})
	}
	function reCal() {
		isMobile.value = _()
	}
	return {
		isMobile,
		reCal
	}
})
