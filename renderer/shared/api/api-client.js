import axios from 'axios'
import getConfig from 'next/config'
import nodeSettings from '../../screens/settings/shared/utils/node'

const {publicRuntimeConfig} = getConfig()

export const baseUrl = nodeSettings.url || publicRuntimeConfig.baseUrl

export const {MOCK = true} = process.env

export default () =>
  axios.create({
    baseURL: nodeSettings.url,
  })
