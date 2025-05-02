import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { setTheme } from 'mdui/functions/setTheme.js'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'

export const useThemeStore = defineStore('homePage', () => {
	const mode = ref('auto')
	const color = ref('#890000')
    function setColor(target) {
        if (color.value != target) {
			color.value = target
		}
		setColorScheme(color.value)
    }
	function setMode(target) {
		if (mode.value != target) {
			mode.value = target
		}
		setTheme(mode.value)
	}
	function switchMode(callback) {
		if (mode.value === 'auto' || mode.value === 'light') {
			mode.value = 'dark'
		} else {
			mode.value = 'light'
		}
		setMode(mode.value)
		if (callback) {
			callback(mode.value)
		}
	}
	function applyTheme() {
		setColorScheme(color.value)
		setTheme(mode.value)
	}
	return { setColor, setMode, switchMode, applyTheme }
})
