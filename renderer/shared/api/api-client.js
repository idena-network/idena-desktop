import axios from 'axios'
import getConfig from 'next/config'

const {publicRuntimeConfig} = getConfig()

export const {baseUrl = 'http://localhost:9009'} = publicRuntimeConfig

export const {MOCK = true} = process.env

export default axios.create({
  baseURL: baseUrl,
})
