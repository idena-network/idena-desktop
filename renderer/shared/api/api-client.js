import axios from 'axios'

export const baseUrl = '//localhost:9009'

export const {MOCK = true} = process.env

export default axios.create({
  baseURL: baseUrl,
})
