<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import 'mdui/components/text-field.js'
import 'mdui/components/button.js'

import Intro from '../texts/intro.md'

const router = useRouter()

const src = ref('')
const srcText = ref(null)
const err = ref(false)

function convert(from) {
	if( Number(from) ) {
		return {
			id: Number(from)
		}
	} else if (from.includes('https://archiveofourown.org/works/')) {
		const sid = from.split('https://archiveofourown.org/works/')[1];
		if ( sid ) {
			const id = Number(sid)
			if (id) {
				return {
					type: 's',
					id
				}
			}
		}
	}
	return {
		type: null,
	}
}

function onConvert() {
	const { id, cid } = convert(src.value)
	if (id == null) {
		err.value = true
		srcText.value?.focus()
	} else {
		err.value = false
		if (cid) router.push(`/work/${id}/${cid}`)
		else router.push(`/work/${id}`)
	}
}

</script>

<template>
	<img style="display: block; margin: 0px auto 10px;" height="200px" alt="logo" src="/favicon.svg" />
	<Intro />
	<br/><Hr/>
	<section id="converter">
		<h2>链接转换</h2>
		<p>输入完整链接或者 ID</p>
		<ClientOnly>
			<mdui-text-field variant="filled" label="链接" placeholder="https://archiveofourown.org/works/114514" @input="src = $event.target.value" ref='srcText'>
			<span  v-if='err' slot="helper" class='warn-text'>链接格式错误!</span>
			</mdui-text-field><br/>
			<div style="display: flex">
				<div style="flex-grow: 1"></div>
				<mdui-button @click='onConvert'>-></mdui-button>
			</div>
			{{ src }}
		<template #ssr>
			Padding...
		</template></ClientOnly>
	</section>
</template>
