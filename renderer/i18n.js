/* eslint-disable camelcase */
import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import {loadPersistentStateValue} from './shared/utils/persist'

import en_translation from '../locales/en/translation.json'
import en_error from '../locales/en/error.json'
import fr_translation from '../locales/fr/translation.json'
import fr_error from '../locales/fr/error.json'
import de_translation from '../locales/de/translation.json'
import de_error from '../locales/de/error.json'
import es_translation from '../locales/es/translation.json'
import es_error from '../locales/es/error.json'
import ru_translation from '../locales/ru/translation.json'
import ru_error from '../locales/ru/error.json'
import zh_translation from '../locales/zh/translation.json'
import zh_error from '../locales/zh/error.json'
import ko_translation from '../locales/ko/translation.json'
import ko_error from '../locales/ko/error.json'
import hr_translation from '../locales/hr/translation.json'
import hr_error from '../locales/hr/error.json'
import uk_translation from '../locales/uk/translation.json'
import uk_error from '../locales/uk/error.json'
import sr_translation from '../locales/sr/translation.json'
import sr_error from '../locales/sr/error.json'

export const AVAILABLE_LANGS = [
  'en',
  'fr',
  'de',
  'es',
  'ru',
  'zh',
  'ko',
  'hr',
  'uk',
  'sr',
]

i18n.use(initReactI18next).init({
  debug: global.isDev,
  resources: {
    en: {translation: en_translation, error: en_error},
    fr: {translation: fr_translation, error: fr_error},
    de: {translation: de_translation, error: de_error},
    es: {translation: es_translation, error: es_error},
    ru: {translation: ru_translation, error: ru_error},
    zh: {translation: zh_translation, error: zh_error},
    ko: {translation: ko_translation, error: ko_error},
    hr: {translation: hr_translation, error: hr_error},
    uk: {translation: uk_translation, error: uk_error},
    sr: {translation: sr_translation, error: sr_error},
  },
  lng: loadPersistentStateValue('settings', 'lng'),
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
