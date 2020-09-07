/* eslint-disable camelcase */
import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import {loadPersistentStateValue} from './shared/utils/persist'

import en_translation from '../locales/en/translation.json'
import en_error from '../locales/en/error.json'
import ri_translation from '../locales/id/translation.json'
import ri_error from '../locales/id/error.json'
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
import ro_translation from '../locales/ro/translation.json'
import ro_error from '../locales/ro/error.json'
import it_translation from '../locales/it/translation.json'
import it_error from '../locales/it/error.json'
import pt_translation from '../locales/pt/translation.json'
import pt_error from '../locales/pt/error.json'
import sl_translation from '../locales/sl/translation.json'
import sl_error from '../locales/sl/error.json'
import hi_translation from '../locales/hi/translation.json'
import hi_error from '../locales/hi/error.json'
import pl_translation from '../locales/pl/translation.json'
import pl_error from '../locales/pl/error.json'
import tr_translation from '../locales/tr/translation.json'
import tr_error from '../locales/tr/error.json'
import bg_translation from '../locales/bg/translation.json'
import bg_error from '../locales/bg/error.json'
import sv_translation from '../locales/sv/translation.json'
import sv_error from '../locales/sv/error.json'
import ja_translation from '../locales/ja/translation.json'
import ja_error from '../locales/ja/error.json'

export const AVAILABLE_LANGS = [
  'en',
  'id',
  'fr',
  'de',
  'es',
  'ru',
  'zh',
  'ko',
  'hr',
  'hi',
  'uk',
  'sr',
  'ro',
  'it',
  'pt',
  'pl',
  'sl',
  'tr',
  'bg',
  'sv',
  'ja',
]

i18n.use(initReactI18next).init({
  debug: global.isDev,
  resources: {
    en: {translation: en_translation, error: en_error},
    id: {translation: ri_translation, error: ri_error},
    fr: {translation: fr_translation, error: fr_error},
    de: {translation: de_translation, error: de_error},
    es: {translation: es_translation, error: es_error},
    ru: {translation: ru_translation, error: ru_error},
    zh: {translation: zh_translation, error: zh_error},
    ko: {translation: ko_translation, error: ko_error},
    hr: {translation: hr_translation, error: hr_error},
    hi: {translation: hi_translation, error: hi_error},
    uk: {translation: uk_translation, error: uk_error},
    sr: {translation: sr_translation, error: sr_error},
    ro: {translation: ro_translation, error: ro_error},
    it: {translation: it_translation, error: it_error},
    pt: {translation: pt_translation, error: pt_error},
    pl: {translation: pl_translation, error: pl_error},
    sl: {translation: sl_translation, error: sl_error},
    tr: {translation: tr_translation, error: tr_error},
    bg: {translation: bg_translation, error: bg_error},
    sv: {translation: sv_translation, error: sv_error},
    ja: {translation: ja_translation, error: ja_error},
  },
  lng: loadPersistentStateValue('settings', 'lng'),
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
