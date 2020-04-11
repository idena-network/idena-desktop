// eslint-disable-next-line import/no-extraneous-dependencies
const {app} = require('electron')

const enTranslation = require('../locales/en/translation.json')
const enError = require('../locales/en/error.json')
const riTranslation = require('../locales/id/translation.json')
const riError = require('../locales/id/error.json')
const frTranslation = require('../locales/fr/translation.json')
const frError = require('../locales/fr/error.json')
const deTranslation = require('../locales/de/translation.json')
const deError = require('../locales/de/error.json')
const esTranslation = require('../locales/es/translation.json')
const esError = require('../locales/es/error.json')
const ruTranslation = require('../locales/ru/translation.json')
const ruError = require('../locales/ru/error.json')
const zhTranslation = require('../locales/zh/translation.json')
const zhError = require('../locales/zh/error.json')
const koTranslation = require('../locales/ko/translation.json')
const koError = require('../locales/ko/error.json')
const hrTranslation = require('../locales/hr/translation.json')
const hrError = require('../locales/hr/error.json')
const ukTranslation = require('../locales/uk/translation.json')
const ukError = require('../locales/uk/error.json')
const srTranslation = require('../locales/sr/translation.json')
const srError = require('../locales/sr/error.json')
const roTranslation = require('../locales/ro/translation.json')
const roError = require('../locales/ro/error.json')
const itTranslation = require('../locales/it/translation.json')
const itError = require('../locales/it/error.json')
const ptTranslation = require('../locales/pt/translation.json')
const ptError = require('../locales/pt/error.json')
const slTranslation = require('../locales/sl/translation.json')
const slError = require('../locales/sl/error.json')
const hiTranslation = require('../locales/hi/translation.json')
const hiError = require('../locales/hi/error.json')
const plTranslation = require('../locales/pl/translation.json')
const plError = require('../locales/pl/error.json')

const getCurrentLang = () => {
  const local = app.getLocale()

  if (local.indexOf('-') > -1) {
    return local.split('-').shift()
  }

  return local
}

const getI18nConfig = isDev => ({
  debug: isDev,
  resources: {
    en: {translation: enTranslation, error: enError},
    id: {translation: riTranslation, error: riError},
    fr: {translation: frTranslation, error: frError},
    de: {translation: deTranslation, error: deError},
    es: {translation: esTranslation, error: esError},
    ru: {translation: ruTranslation, error: ruError},
    zh: {translation: zhTranslation, error: zhError},
    ko: {translation: koTranslation, error: koError},
    hr: {translation: hrTranslation, error: hrError},
    hi: {translation: hiTranslation, error: hiError},
    uk: {translation: ukTranslation, error: ukError},
    sr: {translation: srTranslation, error: srError},
    ro: {translation: roTranslation, error: roError},
    it: {translation: itTranslation, error: itError},
    pt: {translation: ptTranslation, error: ptError},
    pl: {translation: plTranslation, error: plError},
    sl: {translation: slTranslation, error: slError},
  },
  lng: getCurrentLang(),
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
})

module.exports = {getI18nConfig}
