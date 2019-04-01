import axios from 'axios'

export const baseUrl = '//localhost:9009'

export default axios.create({
  baseURL: baseUrl,
})
