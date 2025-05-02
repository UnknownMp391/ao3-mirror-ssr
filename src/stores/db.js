import { ref } from 'vue'
import { defineStore } from 'pinia'

import { openDB } from 'idb';

export const useDB = defineStore('_db', () => {
	const dbPromise = openDB('data', 1, {
		upgrade(db) {
			const bookmarkStore = db.createObjectStore('bookmarks', {
				keyPath: 'id',
				autoIncrement: true,
			})
			bookmarkStore.createIndex('by-workId', 'workId');
		},
	})
	return {
		db: dbPromise
	}
})

export const useBookmarkStore = defineStore('bookmark', () => {
	const db = useDB().db
	async function getAll(workId) {
		return (await db).getAllFromIndex('bookmarks', 'by-workId', workId);
	}
	async function get(id) {
		return (await db).get('bookmarks', id);
	}
	async function add(workId, index, para, name ) {
		return (await db).add('bookmarks', {
			workId, name, para, index
		});
	}
	async function del(id) {
		(await db).delete('bookmarks', id);
	}
	async function delByWork(workId) {
		(await getAll(workId)).forEach(async (item) => {
			del(item.id)
		})
	}
	async function updateName(id, name) {
		const raw = await get(id)
		if (raw) {
			raw.name = name
			console.log(name)
			await (await db).put('bookmarks', raw);
		}
	}
	return {
		get,
		add,
		del,
		getAll,
		delByWork,
		updateName
	}
})
