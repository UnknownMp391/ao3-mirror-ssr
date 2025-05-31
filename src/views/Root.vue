<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import 'mdui/components/text-field.js'
import 'mdui/components/button.js'

import Intro from '../texts/intro.md'

const router = useRouter()

function convert(from) {
	if( Number(from) ) {return {
		type: 's',
		id: Number(from)
	}} else if (from.includes('https://archiveofourown.org/works/')) {
		const sid = from.split('https://archiveofourown.org/works/')[1];
		if ( sid ) {
			const id = Number(sid)
			if (id) { return {
				type: 's',
				id
			}} else {
				const splited = sid.split('/chapters/')
				const id = Number(splited[0])
				const cid = Number(splited[1])
				if (id && cid) return {
					type: 'c',
					id, cid
				}
			}
		}
	}
	return { type: 'f', key: from }
}

function onConvert(data) {
	const { type, id, cid, key } = convert(data.src)
	if (type == null) return
	else if ( type == 'f') router.push(`/search/simple?keyword=${encodeURIComponent(key)}`)
	else {
		if (cid) router.push(`/work/${id}/${cid}`)
		else router.push(`/work/${id}`)
	}
}
</script>

<template>
	<img style="display: block; margin: 0px auto 10px;" height="200px" alt="logo" src="/favicon.svg" />
	<h1>欢迎来到 AO3 Mirror! 👋👋</h1>
	<p>一个基于重构渲染的 AO3 镜像站</p><Hr />
	<section id="converter">
		<h2>链接转换</h2>
		<p>AO3 链接 或 关键词搜索</p>
		<Form @submit="onConvert"><ClientOnly>
			<mdui-text-field variant="filled" label="链接 / 关键词" name="src">
			</mdui-text-field><br/>
			<div style="display: flex">
				<div style="flex-grow: 1"></div>
				<mdui-button type="submit">-></mdui-button>
		</div><template #ssr>
			<input type="text" id="src" name="src" />
			<input type="submit" />
		</template></ClientOnly></Form>
	</section><Hr/>
	<Intro />
</template>

