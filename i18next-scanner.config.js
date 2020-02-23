const AVAILABLE_LANGS = [
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

module.exports = {
  input: ['renderer/**/*.{js,jsx}', '!**/node_modules/**'],
  output: './',
  options: {
    debug: true,
    trans: false,
    func: {
      list: ['t'],
      extensions: ['.js', '.jsx'],
    },
    lngs: AVAILABLE_LANGS,
    defaultValue(_lng, _ns, key) {
      return key
    },
    ns: ['error'],
    resource: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
    },
    nsSeparator: ':',
    keySeparator: false,
  },
}
