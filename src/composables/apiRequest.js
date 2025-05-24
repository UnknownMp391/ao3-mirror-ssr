import { useAxios } from '@vueuse/integrations/useAxios'
import axios from 'axios'

import { objectToQueryString } from '../utils.js'

function getEndpoint() {
  const apiMapping = {
    '': ['http://localhost:28001/', '/api/'],
  }
  let host = import.meta.env.SSR ? 'ssr' : window.location.host
  let entry = apiMapping[host] ?? apiMapping['']
  return import.meta.env.SSR ? entry[0] : replaceUrl(entry[1])
}

function replaceUrl(url) {
  return url
    .replace('{{hostname}}', window.location.hostname)
    .replace('{{port}}', window.location.port)
    .replace('{{protocol}}', window.location.protocol)
}

export function useApiRequest(method, url, data, config = {}) {
  const start = Date.now()
  const baseURL = getEndpoint()
  // 若为 GET 请求，将 data 转为查询参数拼接到 URL 上
  const fullURL = method === 'GET' && data
    ? `${baseURL}${url}?${objectToQueryString(data)}`
    : `${baseURL}${url}`
  const {
    response,
    error,
    isFinished,
    isLoading,
    execute,
  } = useAxios(
    fullURL,
    {
      method,
      ...(method === 'POST' ? { data } : {}),
      ...(config || {})
    },
    {
      immediate: false,
      axios,
    }
  )
  const exec = async () => {
    await execute()
    const stop = Date.now()
    return {
      status: response.value?.status || (error.value?.response?.status ?? -1),
      data: response.value?.data || error.value?.response?.data || null,
      duration: stop - start,
      start,
      stop,
      error: error.value,
      isSSR: import.meta.env.SSR,
    }
  }
  return { execute: exec, isFinished, isLoading }
}
