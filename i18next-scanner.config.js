const AVAILABLE_LANGS = [
  'en',
  'id',
  'fr',
  'de',
  'es',
  'ru',
  'zh',
  'ko',
  'hr',
  'uk',
  'sr',
  'ro',
  'it',
  'pt',
  'pl',
  'sl',
  'hi',
  'tr',
  'bg',
  'sv',
]

module.exports = {
  input: [
    'renderer/**/*.{js,jsx}',
    '!**/renderer/out/**',
    '!**/renderer/.next/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
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
    keySeparator: false,
  },
}
