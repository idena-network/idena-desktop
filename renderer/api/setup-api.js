import axios from 'axios'

export const baseUrl = '//localhost:9010'

export default axios.create({
  baseURL: baseUrl,
})
