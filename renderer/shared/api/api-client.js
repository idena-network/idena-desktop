import axios from 'axios'

export const nodeSettings = {
  url: 'http://localhost:9009',
}

export const baseUrl = nodeSettings.url

export const {MOCK = true} = process.env

export default () =>
  axios.create({
    baseURL: nodeSettings.url,
  })
