import axios from 'axios'
import {loadItem} from '../utils/persist'

export const BASE_API_URL = 'http://localhost:9009'

export default () =>
  axios.create({
    baseURL: loadItem('settings', 'url') || BASE_API_URL,
  })
