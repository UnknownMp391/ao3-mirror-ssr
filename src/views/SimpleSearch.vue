<script setup>
import { ref, onMounted, onServerPrefetch } from 'vue'
import { useRoute } from 'vue-router'

import 'mdui/components/text-field.js'
import 'mdui/components/card.js'

import { escapeAndFormatText } from '../utils.js'
import { useSimpleSearchState } from '../stores/search.js'

const route = useRoute()

const inputField = ref('')

const simpleSearchState = useSimpleSearchState()

onServerPrefetch(async () => {
	if (route.query.keyword) {
		await simpleSearchState.start(route.query.keyword)
	}
	console.log(simpleSearchState.result[0])
})

onMounted(() => {
	inputField.value = route.query.keyword || ''
	if (inputField.value && simpleSearchState != 'ssrready') simpleSearchState.start(inputField.value)
})

function onSubmit(data) {
	if (simpleSearchState) simpleSearchState.start(data.src)
}

</script>

<template>
	<h1>搜索</h1>
	<Form @submit="onSubmit"><ClientOnly>
		<mdui-text-field variant="filled" :value="inputField" label="链接 / 关键词" name="src">
		</mdui-text-field><br/>
		<div style="display: flex">
			<div style="flex-grow: 1"></div>
			<mdui-button type="submit">-></mdui-button>
		</div>
	<template #ssr>
		<input type="text" id="src" name="src" />
		<input type="submit" />
	</template></ClientOnly></Form><Hr />
	<p>State: {{ simpleSearchState.state }}</p><Hr/>
	<template v-if="simpleSearchState.result" v-for="work in simpleSearchState.result" :key="work.workId">
		<ClientOnly><mdui-card style="margin: 8px 0px;"><article>
			<router-link :to="`/work/${work.workId}`"><h3>{{ work.title }}</h3></router-link>
			<h4>{{ work.pseud }}</h4>
			<Hr />
			<p v-html="escapeAndFormatText(work.summary)"></p>
		</article></mdui-card><template #ssr>
			<router-link :to="`/work/${work.workId}`"><h3>{{ work.title }}</h3></router-link>
			<h4>{{ work.pseud }}</h4>
			<p>{{ work.summary }}</p>
			<Hr />
		</template></ClientOnly>
	</template>
</template>
