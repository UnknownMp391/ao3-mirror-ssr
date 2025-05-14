<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import 'mdui/components/text-field.js'
import 'mdui/components/button.js'

import Intro from '../texts/intro.md'

const router = useRouter()

const err = ref(false)
const srcText = ref(null)

function convert(from) {
	if( Number(from) ) {
		return {
			type: 's',
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

function onConvert(data) {
	const { type, id, cid } = convert(data.src)
	console.log(type, id, cid)
	if (type == null) {
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
		<Form @submit="onConvert"><ClientOnly>
			<mdui-text-field variant="filled" label="链接" name="src" placeholder="https://archiveofourown.org/works/114514" ref='srcText'>
			<span v-if='err' slot="helper" class='warn-text'>链接格式错误!</span>
			</mdui-text-field><br/>
			<div style="display: flex">
				<div style="flex-grow: 1"></div>
				<mdui-button type="submit">-></mdui-button>
			</div>
		<template #ssr>
				<input type="text" id="src" name="src" />
				<input type="submit" />
		</template></ClientOnly></Form>
	</section>
</template>
