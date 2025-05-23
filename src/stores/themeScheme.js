import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDark } from '@vueuse/core'

import { setTheme } from 'mdui/functions/setTheme.js'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'

import { useAppSettingStore } from './appSetting.js' 

export const useThemeStore = defineStore('homePage', () => {
	const isDark = useDark()
	const appSetting = useAppSettingStore()
	const mode = ref(appSetting.value.autoTheme ? 'auto' : appSetting.value.darkTheme ? 'dark' : 'light')
	const color = ref(appSetting.value.colorScheme)
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
		if (mode.value === 'auto') {
			mode.value = isDark.value ? 'light' : 'dark'
		} else {
			mode.value = mode.value === 'dark' ? 'light' : 'dark'
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
