import { useSSRContext } from 'vue'

export function useHeadHelper() {
	if (!import.meta.env.SSR) {
		return {
			headReady: () => {},
			setMeta: () => {},
			addMeta: () => {},
			setTitle: () => {},
			setCode: () => {},
		}
	}

	const ssrContext = useSSRContext()

	if (!ssrContext || !ssrContext.headState) {
		return {
			headReady: () => {},
			setMeta: () => {},
			addMeta: () => {},
			setTitle: () => {},
			setCode: () => {},
		}
	}

	return {
		headReady: () => {
			ssrContext.headState.ready = true
		},
		setMeta: (metas = []) => {
			ssrContext.headState.meta = [
				...ssrContext.headState.meta,
				...metas
			]
		},
		addMeta: (meta) => {
			ssrContext.headState.meta.push(meta)
		},
		setTitle: (title) => {
			ssrContext.headState.title = title
		},
		setCode: (code) => {
			ssrContext.headState.code = code
		}
	}
}

