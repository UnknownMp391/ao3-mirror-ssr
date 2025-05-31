import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const CURRENT_VERSION = 1

const DEFAULT_SETTINGS = {
	version: CURRENT_VERSION,
	darkTheme: false,
	autoTheme: true,
	colorScheme: '#890000'
}

export const useAppSettingStore = defineStore('appSetting', () => {
	const stored = useStorage('app-settings', DEFAULT_SETTINGS)
	if (stored.version !== CURRENT_VERSION) {
		Object.assign(stored, DEFAULT_SETTINGS)
	}
	function resetSettings() {
		Object.assign(stored, DEFAULT_SETTINGS)
	}
	return {
		value: stored,
		resetSettings,
	}
})


